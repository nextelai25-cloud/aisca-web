import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resend = new Resend('re_5h5TkAhv_E2ZLiikHZrgWUA4fhzPpn1dT');

// ── Sample member data ──────────────────────────────────────
const member = {
  full_name:         'Risindi Gunesekara',
  membership_number: 'AISCA-AM-2026-0002',
  school:            'All Island Schools Commerce Association',
  created_at:        new Date().toISOString(),
};

// ── 1. Generate PDF card ────────────────────────────────────
const pdfDoc    = await PDFDocument.create();
const page      = pdfDoc.addPage([600, 360]);
const { width, height } = page.getSize();

const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

// Try to load background image from public folder
const bgPath = path.join(__dirname, 'public', 'card-background.png');
if (fs.existsSync(bgPath)) {
  const bgBytes = fs.readFileSync(bgPath);
  const bgImage = await pdfDoc.embedPng(bgBytes);
  page.drawImage(bgImage, { x: 0, y: 0, width, height });
} else {
  // Fallback: clean dark background
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.04, 0.04, 0.04) });
  // Gold accent bar at top
  page.drawRectangle({ x: 0, y: height - 6, width, height: 6,
    color: rgb(0.83, 0.68, 0.21) });
}



// Full name
page.drawText(member.full_name.toUpperCase(), {
  x: 40, y: height - 140,
  size: 38, font: boldFont,
  color: rgb(1, 1, 1),
});

// Role label
page.drawText('ASSOCIATE MEMBER', {
  x: 40, y: height - 172,
  size: 14, font: regularFont,
  color: rgb(0.83, 0.68, 0.21),
});





// Membership number
page.drawText(member.membership_number, {
  x: 40, y: height - 230,
  size: 24, font: boldFont,
  color: rgb(0.83, 0.68, 0.21),
});

// Issue date
const joinDate = new Date(member.created_at).toLocaleDateString('en-LK', {
  year: 'numeric', month: 'long', day: 'numeric',
});
page.drawText(`Issued: ${joinDate}`, {
  x: 40, y: height - 255,
  size: 9, font: regularFont,
  color: rgb(0.4, 0.4, 0.4),
});

// Bottom right: aisca.lk watermark
page.drawText('aisca.lk', {
  x: width - 80, y: 20,
  size: 9, font: regularFont,
  color: rgb(0.3, 0.3, 0.3),
});

const pdfBytes = await pdfDoc.save();
const pdfBuffer = Buffer.from(pdfBytes);
console.log(`✓ PDF generated (${pdfBuffer.length} bytes)`);

// ── 2. Send email with PDF attached ─────────────────────────
const { data, error } = await resend.emails.send({
  from: 'AISCA <noreply@aisca.lk>',
  to:   'risindigunasekara@gmail.com',
  subject: `Welcome to AISCA, ${member.full_name}!`,
  attachments: [
    {
      filename: `AISCA_Membership_Card_${member.membership_number}.pdf`,
      content: pdfBuffer,
    }
  ],
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

    <!-- BLACK HEADER -->
    <div style="background:#000000;padding:30px 40px;">
      <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:5px;">AISCA</div>
      <div style="font-size:9px;font-weight:500;color:rgba(255,255,255,0.40);letter-spacing:0.22em;text-transform:uppercase;">ALL ISLAND SCHOOLS COMMERCE ASSOCIATION</div>
    </div>

    <!-- BODY -->
    <div style="padding:44px 40px 36px;">

      <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0a0a0a;letter-spacing:-0.02em;line-height:1.2;">
        Welcome to AISCA,<br>${member.full_name}.
      </h1>
      <p style="margin:0 0 36px;font-size:14px;color:#555555;line-height:1.7;">
        Your membership has been confirmed. You are now officially part of Sri Lanka's national student commerce movement. Your digital membership card is attached to this email.
      </p>

      <!-- Membership Info Box -->
      <div style="background:#f6f6f6;border:1px solid #e2e2e2;border-radius:4px;padding:22px 26px;margin:0 0 36px;">
        <div style="font-size:9px;font-weight:700;color:#999999;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:8px;">Membership Number</div>
        <div style="font-size:22px;font-weight:800;color:#0a0a0a;letter-spacing:0.05em;margin-bottom:14px;">${member.membership_number}</div>
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
});

if (error) {
  console.error('Failed to send:', JSON.stringify(error, null, 2));
} else {
  console.log('Email sent successfully! ID:', data?.id);
}
