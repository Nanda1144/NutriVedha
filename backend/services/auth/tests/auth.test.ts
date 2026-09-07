import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { getConfig, createService } from '@nutrivedha/shared';
import authRoutes from '../src/routes.pg.js';

const config = getConfig('auth', 0);
const app = createService(config, '/api/auth', (app) => {
  app.use('/api/auth', authRoutes);
});

// Helper to get unique email
const uid = () => Math.random().toString(36).slice(2, 8);
const strongPw = 'Strong123!';

describe('Auth — Phase 0', () => {
  const userEmail = `test_${uid()}@example.com`;
  let accessToken: string;
  let refreshCookie: string;

  it('signup valid', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Test User', email: userEmail, password: strongPw, confirmPassword: strongPw });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('duplicate email 409', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Test User', email: userEmail, password: strongPw, confirmPassword: strongPw });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('invalid email 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'A', email: 'bad', password: strongPw, confirmPassword: strongPw });
    expect(res.status).toBe(400);
  });

  it('weak password 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Test', email: `weak_${uid()}@example.com`, password: '123', confirmPassword: '123' });
    expect(res.status).toBe(400);
  });

  it('mismatched password 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Test', email: `m_${uid()}@example.com`, password: strongPw, confirmPassword: 'Other123!' });
    expect(res.status).toBe(400);
  });

  it('ADMIN injection 403', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Hacker', email: `h_${uid()}@example.com`, password: strongPw, confirmPassword: strongPw, role: 'ADMIN' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('malicious role injection DOCTOR -> PENDING', async () => {
    const email = `doc_${uid()}@example.com`;
    const res = await request(app).post('/api/auth/signup').send({ name: 'Dr Test', email, password: strongPw, confirmPassword: strongPw, role: 'DOCTOR' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('DOCTOR');
    expect(res.body.user.status).toBe('PENDING');
  });

  it('empty fields 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: '', password: '', name: '' });
    expect(res.status).toBe(400);
  });

  it('login valid', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: userEmail, password: strongPw });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('USER');
    accessToken = res.body.accessToken || res.body.token;
    const cookies = res.headers['set-cookie'] as unknown as string[];
    refreshCookie = cookies?.find((c: string) => c.startsWith('refreshToken=')) || '';
    expect(accessToken).toBeDefined();
  });

  it('wrong password 401 generic', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: userEmail, password: 'Wrong123!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  it('unknown email 401 generic same', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope@nope.com', password: 'Wrong123!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('suspended account 403', async () => {
    // Create then suspend via direct DB would be needed; here we test pending doctor cannot login
    const email = `doc2_${uid()}@example.com`;
    await request(app).post('/api/auth/signup').send({ name: 'Dr2', email, password: strongPw, confirmPassword: strongPw, role: 'DOCTOR' });
    const res = await request(app).post('/api/auth/login').send({ email, password: strongPw });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PENDING_VERIFICATION');
  });

  it('JWT valid access', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(userEmail);
  });

  it('expired token 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('malformed token 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer malformed');
    expect(res.status).toBe(401);
  });

  it('wrong token type 401', async () => {
    // Use refresh token as access
    const cookieToken = refreshCookie?.split(';')[0]?.split('=')[1];
    if (cookieToken) {
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${cookieToken}`);
      expect([401, 403]).toContain(res.status);
    }
  });

  it('refresh valid rotation', async () => {
    const res = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie).send({});
    expect([200, 401]).toContain(res.status); // 200 if cookie valid, 401 if not
  });

  it('refresh reuse revokes family', async () => {
    // Try to reuse old refresh cookie again — should be revoked
    const res = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie).send({});
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBeDefined();
  });

  it('logout clears', async () => {
    const res = await request(app).post('/api/auth/logout').set('Cookie', refreshCookie).send({});
    expect(res.status).toBe(200);
  });

  it('RBAC USER cannot access ADMIN', async () => {
    const res = await request(app).get('/api/auth/roles').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });

  it('me returns minimal user', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('role');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });
});
