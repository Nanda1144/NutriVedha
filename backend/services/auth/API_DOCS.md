# NutriVedha Auth API — Phase 0

Base: `http://localhost:8080/api/auth` (gateway)

All success: `{success:true, message, data?, user?, accessToken, token, expiresIn}`  
All error: `{success:false, error:{code,message}, message, code}` + HTTP status

| Method | Endpoint | Auth | Body | Response 200 | Errors | Role |
|---|---|---|---|---|---|---|
| POST | /signup | - | {name,email,password,confirmPassword,phone?,role?} | 201 {user:{id,name,email,role,status,isVerified}} | 400 VALIDATION_ERROR, 409 CONFLICT, 403 FORBIDDEN (ADMIN) | Public -> USER default, professional -> PENDING |
| POST | /register | - | same as signup (alias) | same | same | same |
| POST | /login | - | {email,password} | 200 {user,accessToken,expiresIn:900} + Set-Cookie refreshToken HttpOnly | 400 VALIDATION_ERROR, 401 INVALID_CREDENTIALS (generic), 403 PENDING/SUSPENDED | - |
| POST | /refresh | refresh cookie or body | {} | 200 {user,accessToken} + Set-Cookie rotation | 401 INVALID_TOKEN/REVOKED/EXPIRED, 401 reuse -> revoke family | - |
| POST | /logout | refresh cookie | {} | 200 {message} + clear cookie | - | - |
| POST | /logout-all | Bearer | {} | 200 revoke all | 401 | any |
| GET | /me | Bearer | - | 200 {user:{id,name,email,role,status,isVerified}} | 401 | any |
| GET | /roles | Bearer ADMIN | - | 200 {roles} | 403 | ADMIN |
| POST | /admin/approve | Bearer ADMIN | {userId,action:APPROVE\|REJECT} | 200 {user} | 403/404 | ADMIN |
| POST | /forgot-password | - | {email} | 200 generic | 429 | - |
| POST | /reset-password | - | {token,newPassword,confirmPassword} | 200 | 400 token/weak | - |
| POST | /change-password | Bearer | {currentPassword,newPassword,confirmPassword} | 200 | 401 current wrong | any |
| POST | /verify-email | - | {token} | 200 | 400 | - |
| POST | /resend-verification | Bearer | {} | 200 | 429 | any |
| POST | /otp/request | - | {phone} | 200 {otp dev} | 400/429 | - |
| POST | /otp/verify | - | {phone,otp,name?} | 200 {user,accessToken} | 401 | - |
| POST | /passkey | - | {passkey} | 200 {user,accessToken,passkeyIdentity} | 401 | - |

**Microservices:** `client -> Gateway :8080 -> Auth :3001 -> PG users/refresh_tokens` -> JWT `{sub,role,type}` (15m access, 30d refresh HttpOnly Secure SameSite lax path /api/auth). Frontend `services/client.ts` `credentials:include` + memory accessToken, `userStore` + `GET /me` restores.

**Security:** `hashPassword/isStrongPassword` centralized, `pgQuery` parameterized, `helmet/cors(credentials)` `express.json 10mb`, `ADMIN_PASSKEYS` env server-only, `audit_logs` for all auth events (no secrets).
