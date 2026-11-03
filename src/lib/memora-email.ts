import { Resend } from 'resend'
import { MEMORA } from './memora'
import { esc } from './rangeela-email'

// Email sent right after someone submits the MEMORA '26 ticket form.
// The QR ticket itself is emailed later from the admin dashboard, once the
// bank receipt has been checked.

const FONT = "Georgia,'Times New Roman',serif"
const SANS = 'Arial,Helvetica,sans-serif'
const GOLD = '#E8B54A'
const NAVY = '#0B1230'

export function memoraShell(inner: string, preheader: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MEMORA '26</title></head>
<body style="margin:0;padding:0;background:#060A1C;font-family:${SANS};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060A1C;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${NAVY};border-radius:18px;overflow:hidden;border:1px solid #2A3360;">
  <tr><td style="background:${GOLD};height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td align="center" style="background:#05070F;">
    <img src="https://aisca.lk/memora/email-header.jpg" width="600" alt="MEMORA '26 A Day to Remember" style="display:block;width:100%;max-width:600px;height:auto;font-family:${FONT};font-size:28px;color:${GOLD};" />
  </td></tr>
  ${inner}
  <tr><td style="padding:24px 32px 26px;border-top:1px solid #222B55;" align="center">
    <p style="margin:0 0 6px;font-size:12px;color:#9AA3C7;font-family:${SANS};">Questions? WhatsApp ${MEMORA.helpContacts.map(c => `<a href="https://wa.me/${c.whatsapp}" style="color:${GOLD};text-decoration:none;font-weight:bold;">${c.name} ${c.label}</a>`).join(' or ')}</p>
    <p style="margin:0;font-size:11px;color:#6E77A0;font-family:${SANS};">All Island Schools Commerce Association · <a href="https://aisca.lk" style="color:#6E77A0;">aisca.lk</a></p>
  </td></tr>
  <tr><td style="background:${GOLD};height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

export function memoraWhatsappBlock(): string {
  if (!MEMORA.whatsappGroup) return ''
  return `<tr><td style="padding:6px 32px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E2A1C;border:1px solid #1F6B43;border-radius:14px;">
    <tr><td style="padding:18px 22px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#BBF7D0;font-family:${SANS};">Join the MEMORA '26 WhatsApp group</p>
      <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#A7C7B4;font-family:${SANS};">All event updates, reminders and last minute details are shared here first. Please join even before your ticket arrives.</p>
      <a href="${MEMORA.whatsappGroup}" style="display:inline-block;background:#25D366;color:#FFFFFF;padding:11px 22px;border-radius:999px;font-size:13px;font-weight:bold;text-decoration:none;font-family:${SANS};">Join the WhatsApp group</a>
    </td></tr>
  </table>
</td></tr>`
}

export async function sendMemoraReceivedEmail({ to, name, ticketNumber, amount }: { to: string; name: string; ticketNumber: string; amount: number }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !to) return
  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('resend.dev')
    ? `MEMORA '26 by AISCA <${process.env.RESEND_FROM_EMAIL}>`
    : "MEMORA '26 by AISCA <noreply@aisca.lk>"
  const first = esc((name || 'there').split(' ')[0])
  const cell = (label: string, value: string) =>
    `<td width="33%" style="padding:12px 6px;text-align:center;background:#121A40;border-radius:12px;border:1px solid #26305E;"><p style="margin:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#8790B8;font-family:${SANS};">${label}</p><p style="margin:5px 0 0;font-size:14px;font-weight:bold;color:${GOLD};font-family:${SANS};">${value}</p></td>`

  const inner = `
  <tr><td style="padding:28px 32px 4px;">
    <h1 style="margin:0 0 12px;font-size:25px;line-height:1.3;color:#FFFFFF;font-family:${FONT};font-weight:normal;">Hi ${first}, we got your request.</h1>
    <p style="margin:0 0 14px;font-size:14.5px;line-height:1.7;color:#C3C9E4;font-family:${SANS};">Thank you for getting your ticket for MEMORA '26. Your details and bank receipt are with us now.</p>
    <p style="margin:0 0 20px;font-size:14.5px;line-height:1.7;color:#C3C9E4;font-family:${SANS};">Our team checks every payment by hand. Once yours is confirmed, your personal QR ticket will arrive in this inbox and by SMS to your phone. Please check your spam or promotions folder too.</p>
  </td></tr>
  <tr><td style="padding:0 32px 18px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#101736;border:1px dashed ${GOLD};border-radius:14px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8790B8;font-family:${SANS};">Your reference</p>
        <p style="margin:0 0 10px;font-size:22px;font-weight:bold;color:${GOLD};font-family:${SANS};">${esc(ticketNumber)}</p>
        <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#C3C9E4;font-family:${SANS};">Ticket price: <strong style="color:#FFFFFF;">LKR ${amount.toLocaleString()}</strong></p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#C3C9E4;font-family:${SANS};">Status: <strong style="color:#F4A04A;">Waiting for payment verification</strong></p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 32px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${cell('Date', MEMORA.dateShort)}<td width="4"></td>${cell('Time', MEMORA.timeLabel)}<td width="4"></td>${cell('Venue', MEMORA.venue)}
    </tr></table>
  </td></tr>
  ${memoraWhatsappBlock()}
  <tr><td style="padding:14px 32px 8px;">
    <p style="margin:0;font-size:13.5px;line-height:1.7;color:#C3C9E4;font-family:${SANS};">A night to remember is on its way.<br/><strong style="color:#FFFFFF;">Team AISCA</strong></p>
  </td></tr>`

  try {
    await resend.emails.send({
      from,
      to,
      subject: `We received your MEMORA '26 ticket request (${ticketNumber})`,
      html: memoraShell(inner, 'Your payment is being checked. Your QR ticket will follow soon.'),
    })
  } catch (err) {
    console.error('[memora] received email failed:', err)
  }
}
