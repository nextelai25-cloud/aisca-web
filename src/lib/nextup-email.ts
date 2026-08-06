import { Resend } from 'resend'

// Confirmation email sent to a NextUp applicant after they submit.
export async function sendNextUpReceivedEmail({ to, name }: { to: string; name: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !to) return
  const resend = new Resend(apiKey)

  const fromAddress =
    process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('resend.dev')
      ? `AISCA NextUp <${process.env.RESEND_FROM_EMAIL}>`
      : 'AISCA NextUp <noreply@aisca.lk>'

  const firstName = (name || 'there').split(' ')[0]

  try {
    await resend.emails.send({
      from: fromAddress,
      to,
      subject: 'Your NextUp application has been received',
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5;">
  <div style="max-width:560px;margin:0 auto;padding:40px 28px;">
    <div style="text-align:center;margin-bottom:8px;">
      <span style="display:inline-block;font-size:11px;letter-spacing:0.28em;color:#e11d2a;font-weight:700;text-transform:uppercase;">AISCA × Business Advisor Junior</span>
    </div>
    <h1 style="text-align:center;font-size:40px;font-weight:800;letter-spacing:-0.02em;margin:6px 0 18px;color:#ffffff;">NEXTUP</h1>
    <div style="background:#141414;border:1px solid rgba(225,29,42,0.35);border-radius:16px;padding:28px 24px;">
      <p style="font-size:16px;color:#ffffff;margin:0 0 14px;">Hi ${firstName},</p>
      <p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 14px;">
        Thank you — your story is in. We read every single application, and our team will be in touch with the founders selected for NextUp.
      </p>
      <p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0;">
        Keep building.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:rgba(255,255,255,0.35);margin-top:24px;">
      A national initiative spotlighting Sri Lanka's boldest young entrepreneurs, changemakers, and innovators.
    </p>
  </div>
</body>
</html>`,
    })
  } catch (err) {
    console.error('[nextup] email failed:', err)
  }
}
