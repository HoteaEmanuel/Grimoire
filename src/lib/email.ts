import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? "Grimoire <onboarding@resend.dev>"

export async function sendPasswordResetEmail(email: string, token: string) {
  const base =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const url = `${base}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  console.log(`\n[DEV] Password reset link for ${email}:\n${url}\n`)

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Grimoire password",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Grimoire password</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e8e2db;border-radius:16px;overflow:hidden;">

              <!-- Header band -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#f5f0ff,#fff8f0);padding:28px 40px 24px;border-bottom:1px solid #ede8e2;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#7c3aed;">✦ Grimoire</span>
                          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#1a1208;letter-spacing:-0.2px;">Reset your password</p>
                        </td>
                        <td align="right" valign="middle">
                          <div style="background:#ede9ff;border:1px solid #d4c8fa;border-radius:50%;width:48px;height:48px;line-height:48px;text-align:center;font-size:22px;">🔑</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px 32px;">

                    <p style="margin:0 0 28px;font-size:15px;color:#6b5f52;line-height:1.75;">
                      We received a request to reset the password for your Grimoire account. Click the button below to choose a new password.
                    </p>

                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9e8f7e;">Account</p>
                    <p style="margin:0 0 28px;font-size:14px;color:#3d3028;background:#f8f5f2;border:1px solid #e8e2db;border-radius:8px;padding:10px 14px;">${email}</p>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="border-radius:10px;background:linear-gradient(135deg,#5b21b6,#7c3aed);">
                          <a href="${url}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                            Reset password →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      <tr>
                        <td style="background:#fdf8f0;border:1px solid #ecdfc8;border-radius:8px;padding:10px 16px;">
                          <span style="font-size:13px;color:#8a6e3a;">⏱ This link expires in <strong style="color:#7a5520;">15 minutes</strong></span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid #ede8e2;padding-top:24px;">
                          <p style="margin:0;font-size:12px;color:#9e8f7e;line-height:1.8;text-align:center;">
                            If you didn't request a password reset, you can safely ignore this email.<br/>
                            This link can only be used once.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:11px;color:#b0a89e;letter-spacing:0.06em;text-transform:uppercase;">
                © 2026 Grimoire · Developer Knowledge Hub
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

export async function sendVerificationEmail(email: string, token: string) {
  const base =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const url = `${base}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  console.log(`\n[DEV] Verification link for ${email}:\n${url}\n`)

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your Grimoire account",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your Grimoire account</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e8e2db;border-radius:16px;overflow:hidden;">

              <!-- Header band -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#f5f0ff,#fff8f0);padding:28px 40px 24px;border-bottom:1px solid #ede8e2;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#7c3aed;">✦ Grimoire</span>
                          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#1a1208;letter-spacing:-0.2px;">Verify your email</p>
                        </td>
                        <td align="right" valign="middle">
                          <div style="background:#ede9ff;border:1px solid #d4c8fa;border-radius:50%;width:48px;height:48px;line-height:48px;text-align:center;font-size:22px;">✉</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px 32px;">

                    <p style="margin:0 0 28px;font-size:15px;color:#6b5f52;line-height:1.75;">
                      You're one step away from your Grimoire. Confirm your address to activate your account.
                    </p>

                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9e8f7e;">Registering as</p>
                    <p style="margin:0 0 28px;font-size:14px;color:#3d3028;background:#f8f5f2;border:1px solid #e8e2db;border-radius:8px;padding:10px 14px;">${email}</p>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="border-radius:10px;background:linear-gradient(135deg,#5b21b6,#7c3aed);">
                          <a href="${url}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                            Verify email address →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      <tr>
                        <td style="background:#fdf8f0;border:1px solid #ecdfc8;border-radius:8px;padding:10px 16px;">
                          <span style="font-size:13px;color:#8a6e3a;">⏱ This link expires in <strong style="color:#7a5520;">15 minutes</strong></span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid #ede8e2;padding-top:24px;">
                          <p style="margin:0;font-size:12px;color:#9e8f7e;line-height:1.8;text-align:center;">
                            If you didn't create a Grimoire account, you can safely ignore this email.<br/>
                            This link can only be used once.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:11px;color:#b0a89e;letter-spacing:0.06em;text-transform:uppercase;">
                © 2026 Grimoire · Developer Knowledge Hub
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}
