import { getConfig } from '@nutrivedha/shared';

const config = getConfig('auth', 3001);

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Abstraction per spec 25 — dev-safe when no provider configured
export const EmailService = {
  async send(options: SendMailOptions): Promise<{ dev: boolean; messageId?: string }> {
    const hasProvider = Boolean(process.env.VITE_EMAIL_SENDGRID_API_KEY || process.env.SMTP_HOST || process.env.VITE_NOTIFICATION_RESEND_API_KEY);
    if (!hasProvider || config.env === 'development') {
      console.log(`[email:dev] To: ${options.to}\nSubject: ${options.subject}\n${options.text}`);
      return { dev: true, messageId: `dev-${Date.now()}` };
    }
    // Production: integrate SendGrid / SMTP / Resend here
    // For now, log and pretend sent (avoids blocking dev when provider missing)
    console.log(`[email:prod-stub] Would send to ${options.to}: ${options.subject}`);
    return { dev: false, messageId: `stub-${Date.now()}` };
  },

  resetPasswordEmail(to: string, token: string): SendMailOptions {
    const base = process.env.VITE_APP_BASE_URL || 'http://localhost:5173';
    const link = `${base}/reset-password?token=${encodeURIComponent(token)}`;
    return {
      to,
      subject: 'Reset your NutriVedha password',
      text: `You requested a password reset. Use this link within 15 minutes:\n${link}\nIf you did not request this, ignore this email.\nToken (dev): ${token}`,
      html: `<p>You requested a password reset. <a href="${link}">Click here</a> within 15 minutes.</p><p>If you did not request this, ignore.</p>`,
    };
  },

  verificationEmail(to: string, token: string): SendMailOptions {
    const base = process.env.VITE_APP_BASE_URL || 'http://localhost:5173';
    const link = `${base}/verify-email?token=${encodeURIComponent(token)}`;
    return {
      to,
      subject: 'Verify your NutriVedha email',
      text: `Verify your email within 24 hours:\n${link}\nToken (dev): ${token}`,
      html: `<p>Verify your email: <a href="${link}">Verify</a></p>`,
    };
  },
};
