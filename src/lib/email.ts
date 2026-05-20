import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail({
  to,
  name,
  membershipNumber,
  cardUrl,
  pdfBytes
}: {
  to: string
  name: string
  membershipNumber: string
  cardUrl: string | null
  pdfBytes?: Buffer | null
}) {
  const attachments = pdfBytes ? [
    {
      filename: `AISCA_Membership_Card_${membershipNumber}.pdf`,
      content: pdfBytes
    }
  ] : []

  const { data, error } = await resend.emails.send({
    from: 'AISCA <noreply@aisca.lk>',
    to,
    subject: `Welcome to AISCA, ${name}!`,
    attachments,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AISCA</title>
</head>
<body style="margin:0;padding:0;background:#ebebeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">

    <!-- Header -->
    <div style="padding:32px 40px;text-align:center;border-bottom:1px solid #1a1a1a;background:#000000;">
      <img 
        src="https://aisca.lk/aisca-logo.webp" 
        alt="AISCA" 
        style="height:48px;width:auto;object-fit:contain;"
      />
      <p style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:0.15em;margin:8px 0 0;text-transform:uppercase;">
        All Island Schools Commerce Association
      </p>
    </div>

    <!-- BODY -->
    <div style="padding:44px 40px 36px;">

      <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0a0a0a;letter-spacing:-0.02em;line-height:1.2;">
        Welcome to AISCA,<br>${name}.
      </h1>
      <p style="margin:0 0 36px;font-size:14px;color:#555555;line-height:1.7;">
        Your membership has been confirmed. You are now officially part of Sri Lanka's national student commerce movement. Your digital membership card is attached to this email.
      </p>

      <!-- Membership Info Box -->
      <div style="background:#f6f6f6;border:1px solid #e2e2e2;border-radius:4px;padding:22px 26px;margin:0 0 36px;">
        <div style="font-size:9px;font-weight:700;color:#999999;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:8px;">Membership Number</div>
        <div style="font-size:22px;font-weight:800;color:#0a0a0a;letter-spacing:0.05em;margin-bottom:14px;">${membershipNumber}</div>
        <div style="border-top:1px solid #e0e0e0;padding-top:12px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;color:#888888;padding:3px 0;">Membership Type</td>
              <td style="font-size:12px;color:#0a0a0a;font-weight:600;text-align:right;padding:3px 0;">Associate Member</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#888888;padding:3px 0;">Status</td>
              <td style="font-size:12px;color:#0a0a0a;font-weight:600;text-align:right;padding:3px 0;">Active &#10003;</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Section label -->
      <div style="font-size:9px;font-weight:700;color:#999999;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:4px;border-top:1px solid #eeeeee;padding-top:28px;">
        What this means for you
      </div>

      <!-- Benefits Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:36px;">
        <tr style="border-bottom:1px solid #eeeeee;">
          <td style="padding:13px 0;font-size:13px;color:#0a0a0a;font-weight:500;">Island-wide student network</td>
          <td style="padding:13px 0;font-size:13px;color:#777777;text-align:right;">2,000+ students</td>
        </tr>
        <tr style="border-bottom:1px solid #eeeeee;">
          <td style="padding:13px 0;font-size:13px;color:#0a0a0a;font-weight:500;">Commerce society coverage</td>
          <td style="padding:13px 0;font-size:13px;color:#777777;text-align:right;">80+ schools</td>
        </tr>
        <tr style="border-bottom:1px solid #eeeeee;">
          <td style="padding:13px 0;font-size:13px;color:#0a0a0a;font-weight:500;">National events &amp; competitions</td>
          <td style="padding:13px 0;font-size:13px;color:#777777;text-align:right;">Members only</td>
        </tr>
        <tr>
          <td style="padding:13px 0;font-size:13px;color:#0a0a0a;font-weight:500;">Official digital membership card</td>
          <td style="padding:13px 0;font-size:13px;color:#777777;text-align:right;">See attachment</td>
        </tr>
      </table>

      <p style="font-size:13px;color:#666666;line-height:1.7;margin:0 0 28px;">
        Join the AISCA WhatsApp channel to stay connected with commerce students across the island and receive updates on upcoming events and opportunities.
      </p>

      <!-- CTA -->
      <a href="https://whatsapp.com/channel/0029Vak5dvg4IBhIrk1DsK3i"
         style="display:inline-block;background:#000000;color:#ffffff;padding:14px 30px;border-radius:4px;font-weight:700;font-size:12px;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase;">
        Join WhatsApp Channel
      </a>

      <p style="margin:24px 0 0;font-size:11px;color:#aaaaaa;line-height:1.6;">
        Follow us for daily updates &nbsp;&mdash;&nbsp;
        <a href="https://www.instagram.com/aisca.lk/" style="color:#0a0a0a;font-weight:700;text-decoration:none;">@aisca.lk</a>
        on Instagram.
      </p>
    </div>

    <!-- FOOTER -->
    <div style="background:#f4f4f4;border-top:1px solid #e6e6e6;padding:22px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:10px;color:#aaaaaa;letter-spacing:0.03em;">
        AISCA &mdash; The national platform for Sri Lanka's commerce students.
      </p>
      <p style="margin:0;font-size:10px;color:#bbbbbb;">
        This is an automated message. Please do not reply. &nbsp;&middot;&nbsp;
        <a href="https://aisca.lk" style="color:#888888;text-decoration:none;">aisca.lk</a>
      </p>
    </div>

  </div>
</body>
</html>
    `
  })

  if (error) console.error('Resend send error:', JSON.stringify(error))
  else console.log('Email sent successfully, id:', data?.id)
  return { data, error }
}
