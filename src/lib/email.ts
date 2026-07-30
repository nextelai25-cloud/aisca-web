import { Resend } from 'resend'

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
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  // Fetch PDF for attachment if cardUrl exists
  let attachments: any[] = []
  if (pdfBytes) {
    attachments = [{
      filename: `AISCA-Membership-Card-${membershipNumber}.pdf`,
      content: pdfBytes,
      type: 'application/pdf'
    }]
  } else if (cardUrl) {
    try {
      const pdfResponse = await fetch(cardUrl)
      if (pdfResponse.ok) {
        const pdfBuffer = await pdfResponse.arrayBuffer()
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
        attachments = [{
          filename: `AISCA-Membership-Card-${membershipNumber}.pdf`,
          content: pdfBase64,
          type: 'application/pdf'
        }]
      }
    } catch (err) {
      console.error('Failed to fetch PDF for attachment:', err)
    }
  }

  // Use the configured sender; falls back to noreply@aisca.lk (domain must be
  // verified in the Resend dashboard, otherwise sends will fail).
  const fromAddress = process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('resend.dev')
    ? `AISCA <${process.env.RESEND_FROM_EMAIL}>`
    : 'AISCA <noreply@aisca.lk>'

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject: `Welcome to AISCA, ${name}. Your Membership Card is Ready`,
    attachments,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0d0d0d;border-radius:12px;overflow:hidden;">

  <!-- HEADER -->
  <tr>
    <td align="center" style="background:#0a0a0a;padding:36px 40px;border-bottom:3px solid #d4ad35;">
      <img src="https://aisca.lk/aisca-email-logo.png" alt="AISCA — All Island Schools Commerce Association" width="240" style="display:block;margin:0 auto;max-width:240px;width:100%;height:auto;color:#ffffff;font-size:22px;font-weight:700;font-family:Arial,sans-serif;" />
    </td>
  </tr>

  <!-- WELCOME -->
  <tr>
    <td style="padding:40px 40px 0;">
      <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 16px;line-height:1.3;font-family:Arial,sans-serif;">
        Welcome to AISCA,<br>${name}.
      </h1>
      <p style="color:#888888;font-size:15px;line-height:1.7;margin:0 0 32px;font-family:Arial,sans-serif;">
        Your membership has been confirmed. You are now officially part of Sri Lanka's national student commerce movement. Your digital membership card is attached to this email.
      </p>
    </td>
  </tr>

  <!-- MEMBERSHIP NUMBER CARD -->
  <tr>
    <td style="padding:0 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #333333;border-radius:10px;padding:24px;">
        <tr>
          <td>
            <p style="color:#666666;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 10px;font-family:Arial,sans-serif;">Membership Number</p>
            <p style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px;font-family:Arial,sans-serif;">${membershipNumber}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #333333;padding-top:14px;margin-top:4px;">
              <tr>
                <td style="color:#666666;font-size:13px;font-family:Arial,sans-serif;">Membership Type</td>
                <td align="right" style="color:#ffffff;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">Associate Member</td>
              </tr>
              <tr>
                <td style="color:#666666;font-size:13px;padding-top:8px;font-family:Arial,sans-serif;">Status</td>
                <td align="right" style="color:#ffffff;font-size:13px;font-weight:700;padding-top:8px;font-family:Arial,sans-serif;">Active</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- DOWNLOAD CARD BUTTON -->
  ${cardUrl ? `
  <tr>
    <td align="center" style="padding:32px 40px 0;">
      <p style="color:#666666;font-size:13px;margin:0 0 16px;font-family:Arial,sans-serif;">Your official digital membership card is ready:</p>
      <a href="${cardUrl}" target="_blank" style="display:inline-block;background:#ffffff;color:#000000;padding:14px 36px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;font-family:Arial,sans-serif;">
        Download Membership Card
      </a>
      <p style="color:#444444;font-size:11px;margin:12px 0 0;font-family:Arial,sans-serif;">Card is also attached to this email as a PDF</p>
    </td>
  </tr>
  ` : ''}

  <!-- WHAT THIS MEANS -->
  <tr>
    <td style="padding:32px 40px 0;">
      <p style="color:#444444;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;border-top:1px solid #222222;padding-top:24px;font-family:Arial,sans-serif;">What This Means For You</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#cccccc;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;font-family:Arial,sans-serif;">Island-wide student network</td><td align="right" style="color:#666666;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;font-family:Arial,sans-serif;">2,000+ students</td></tr>
        <tr><td style="color:#cccccc;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;font-family:Arial,sans-serif;">Commerce society coverage</td><td align="right" style="color:#666666;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;font-family:Arial,sans-serif;">80+ schools</td></tr>
        <tr><td style="color:#cccccc;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;font-family:Arial,sans-serif;">National events and competitions</td><td align="right" style="color:#666666;font-size:13px;padding:8px 0;border-bottom:1px solid #1a1a1a;font-family:Arial,sans-serif;">Members only</td></tr>
        <tr><td style="color:#cccccc;font-size:13px;padding:8px 0;font-family:Arial,sans-serif;">Official digital membership card</td><td align="right" style="color:#666666;font-size:13px;padding:8px 0;font-family:Arial,sans-serif;">See attachment</td></tr>
      </table>
    </td>
  </tr>

  <!-- WHATSAPP -->
  <tr>
    <td style="padding:28px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;border-radius:10px;padding:20px;">
        <tr>
          <td>
            <p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 8px;font-family:Arial,sans-serif;">Join the AISCA Associate Group</p>
            <p style="color:#666666;font-size:13px;margin:0 0 16px;font-family:Arial,sans-serif;">Connect directly with fellow associates across Sri Lanka</p>
            <a href="https://chat.whatsapp.com/Li5UyOvxKRjH33PCLhId1o" target="_blank" style="display:inline-block;background:#ffffff;color:#000000;padding:10px 24px;border-radius:6px;font-weight:600;font-size:13px;text-decoration:none;font-family:Arial,sans-serif;">
              Join WhatsApp Group
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SOCIAL -->
  <tr>
    <td style="padding:24px 40px 0;">
      <p style="color:#444444;font-size:12px;margin:0;font-family:Arial,sans-serif;">
        Follow us: 
        <a href="https://www.instagram.com/aisca.lk/" style="color:#888888;">Instagram</a> &nbsp;|&nbsp;
        <a href="https://www.linkedin.com/company/all-island-schools-commerce-association-aisca/" style="color:#888888;">LinkedIn</a> &nbsp;|&nbsp;
        <a href="https://web.facebook.com/profile.php?id=61586432106049" style="color:#888888;">Facebook</a>
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td align="center" style="padding:28px 40px;border-top:1px solid #1a1a1a;margin-top:28px;">
      <p style="color:#333333;font-size:11px;margin:0;font-family:Arial,sans-serif;">
        2026 All Island Schools Commerce Association · Colombo, Sri Lanka · <a href="https://aisca.lk" style="color:#444444;">aisca.lk</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>
`
  })

  if (error) console.error('Resend error:', JSON.stringify(error))
  else console.log('Email sent:', data?.id)
  return { data, error }
}
