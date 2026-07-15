function shell(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9);padding:28px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:600;">JNV Smart Connect</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#111827;">
                <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f9fafb;color:#6b7280;font-size:12px;">
                Jawahar Navodaya Vidyalaya &middot; This is an automated message, please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function passwordResetEmail(name: string, resetUrl: string, expiresInMinutes: number) {
  return shell(
    "Reset your password",
    `<p style="margin:0 0 16px;color:#374151;">Hi ${name},</p>
     <p style="margin:0 0 24px;color:#374151;">We received a request to reset your JNV Smart Connect password. This link expires in ${expiresInMinutes} minutes.</p>
     <a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Reset Password</a>
     <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">If you did not request this, you can safely ignore this email.</p>`
  );
}

export function welcomeEmail(name: string, role: string, loginUrl: string) {
  return shell(
    "Welcome to JNV Smart Connect",
    `<p style="margin:0 0 16px;color:#374151;">Hi ${name},</p>
     <p style="margin:0 0 24px;color:#374151;">Your account has been created with the role <strong>${role}</strong>. You can now sign in and get started.</p>
     <a href="${loginUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Go to Login</a>`
  );
}
