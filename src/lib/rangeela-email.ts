import { Resend } from 'resend'
import { RANGEELA } from './rangeela'

// Email sent right after someone submits the RANGEELA '26 ticket form.
// The real QR ticket is emailed later from the admin dashboard, once the
// bank receipt has been checked.

const FONT = "Arial,Helvetica,sans-serif"
const RAINBOW = ['#E6007E', '#FF4D2E', '#FF9F1C', '#FFD60A', '#2EC4B6', '#3A86FF', '#7B2FF7']

export function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function rainbowBar(height = 6): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${RAINBOW.map(
    (c) => `<td style="background:${c};height:${height}px;font-size:0;line-height:0;">&nbsp;</td>`
  ).join('')}</tr></table>`
}

export function rangeelaShell(inner: string, preheader: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RANGEELA '26</title></head>
<body style="margin:0;padding:0;background:#FFF4EC;font-family:${FONT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4EC;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #F3E3F0;">
  <tr><td>${rainbowBar(6)}</td></tr>
  <tr><td align="center" style="padding:30px 28px 6px;background:#FFFDFB;">
    <img src="https://aisca.lk/rangeela/logo-email.png" width="300" alt="RANGEELA '26 A Celebration of Hues" style="display:block;width:300px;max-width:80%;height:auto;margin:0 auto;font-family:${FONT};font-size:26px;font-weight:bold;color:#E6007E;" />
    <p style="margin:14px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8A7A86;font-family:${FONT};">All Island Schools Commerce Association</p>
  </td></tr>
  ${inner}
  <tr><td style="padding:26px 32px 28px;border-top:1px solid #F4EAF2;" align="center">
    <p style="margin:0 0 6px;font-size:12px;color:#8A7A86;font-family:${FONT};">Questions? Message AISCA on WhatsApp: <a href="https://wa.me/${RANGEELA.helpWhatsapp}" style="color:#7B2FF7;text-decoration:none;font-weight:bold;">${RANGEELA.helpWhatsappLabel}</a></p>
    <p style="margin:0;font-size:11px;color:#B3A5AF;font-family:${FONT};">All Island Schools Commerce Association · <a href="https://aisca.lk" style="color:#B3A5AF;">aisca.lk</a></p>
  </td></tr>
  <tr><td>${rainbowBar(6)}</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

export function whatsappBlock(): string {
  return `<tr><td style="padding:8px 32px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1FBF4;border:1px solid #CDEFD8;border-radius:14px;">
    <tr><td style="padding:20px 22px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#14532D;font-family:${FONT};">Join the RANGEELA '26 WhatsApp group</p>
      <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#3F6B4F;font-family:${FONT};">All event updates, reminders and last minute details are shared here first. Please join even if you already have your ticket.</p>
      <a href="${RANGEELA.whatsappGroup}" style="display:inline-block;background:#25D366;color:#FFFFFF;padding:11px 22px;border-radius:999px;font-size:13px;font-weight:bold;text-decoration:none;font-family:${FONT};">Join the WhatsApp group</a>
    </td></tr>
  </table>
</td></tr>`
}

export async function sendRangeelaReceivedEmail({ to, name, ticketNumber }: { to: string; name: string; ticketNumber: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !to) return
  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('resend.dev')
    ? `RANGEELA '26 by AISCA <${process.env.RESEND_FROM_EMAIL}>`
    : "RANGEELA '26 by AISCA <noreply@aisca.lk>"
  const first = esc((name || 'there').split(' ')[0])

  const inner = `
  <tr><td style="padding:26px 32px 4px;">
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:#2B1B2E;font-family:${FONT};">Hi ${first}, we got your request!</h1>
    <p style="margin:0 0 14px;font-size:14.5px;line-height:1.7;color:#5B4A58;font-family:${FONT};">Thank you for getting your ticket for RANGEELA '26. Your details and bank receipt are with us now.</p>
    <p style="margin:0 0 20px;font-size:14.5px;line-height:1.7;color:#5B4A58;font-family:${FONT};">Our team will check your payment by hand. Once it is confirmed, your personal QR ticket will arrive in this inbox. Please keep an eye on your spam or promotions folder too, just in case.</p>
  </td></tr>
  <tr><td style="padding:0 32px 18px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7FB;border:1px dashed #E7A6CF;border-radius:14px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#A07A95;font-family:${FONT};">Your reference</p>
        <p style="margin:0 0 10px;font-size:22px;font-weight:bold;color:#7B2FF7;font-family:${FONT};">${esc(ticketNumber)}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#5B4A58;font-family:${FONT};">Status: <strong style="color:#C2410C;">Waiting for payment verification</strong></p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 32px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="33%" style="padding:10px 6px;text-align:center;background:#FFF1E6;border-radius:12px;"><p style="margin:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#A0826B;font-family:${FONT};">Date</p><p style="margin:4px 0 0;font-size:14px;font-weight:bold;color:#E0561B;font-family:${FONT};">17th October</p></td>
        <td width="4"></td>
        <td width="33%" style="padding:10px 6px;text-align:center;background:#EEF6FF;border-radius:12px;"><p style="margin:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#6B7FA0;font-family:${FONT};">Time</p><p style="margin:4px 0 0;font-size:14px;font-weight:bold;color:#2563EB;font-family:${FONT};">3.00 PM onwards</p></td>
        <td width="4"></td>
        <td width="33%" style="padding:10px 6px;text-align:center;background:#F5EEFF;border-radius:12px;"><p style="margin:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#8A76A8;font-family:${FONT};">Venue</p><p style="margin:4px 0 0;font-size:14px;font-weight:bold;color:#7B2FF7;font-family:${FONT};">Hyde Park Grounds</p></td>
      </tr>
    </table>
  </td></tr>
  ${whatsappBlock()}
  <tr><td style="padding:14px 32px 8px;">
    <p style="margin:0;font-size:13.5px;line-height:1.7;color:#5B4A58;font-family:${FONT};">See you soon in white, ready to be covered in colour.<br/><strong style="color:#2B1B2E;">Team AISCA</strong></p>
  </td></tr>`

  try {
    await resend.emails.send({
      from,
      to,
      subject: `We received your RANGEELA '26 ticket request (${ticketNumber})`,
      html: rangeelaShell(inner, 'Your payment is being checked. Your QR ticket will follow soon.'),
    })
  } catch (err) {
    console.error('[rangeela] received email failed:', err)
  }
}
