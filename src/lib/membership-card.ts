import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { supabaseAdmin } from './supabase'
import fs from 'fs'
import path from 'path'

export async function generateMembershipCard(member: {
  id: string
  full_name: string
  membership_number: string
  school: string
  created_at: string
}) {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 360]) // landscape card
    const { width, height } = page.getSize()
    
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    // Load and embed the card background image
    let bgImage;
    try {
      const bgPath = path.join(process.cwd(), 'public', 'card-background.png')
      if (fs.existsSync(bgPath)) {
        const bgBytes = fs.readFileSync(bgPath)
        bgImage = await pdfDoc.embedPng(bgBytes)
      }
    } catch (bgErr) {
      console.error("Failed to load and embed card background image:", bgErr)
    }

    if (bgImage) {
      page.drawImage(bgImage, {
        x: 0,
        y: 0,
        width,
        height
      })
    } else {
      // Fallback plain dark background
      page.drawRectangle({
        x: 0, y: 0, width, height,
        color: rgb(0.04, 0.04, 0.04)
      })
      // Gold accent bar at top
      page.drawRectangle({
        x: 0, y: height - 6, width, height: 6,
        color: rgb(0.83, 0.68, 0.21)
      })
    }
    
    // Full name
    page.drawText(member.full_name.toUpperCase(), {
      x: 40, y: height - 140,
      size: 38, font: boldFont,
      color: rgb(1, 1, 1)
    })
    
    // Role
    page.drawText('ASSOCIATE MEMBER', {
      x: 40, y: height - 172,
      size: 14, font: regularFont,
      color: rgb(0.83, 0.68, 0.21),
    })
    
    // Membership number
    page.drawText(member.membership_number, {
      x: 40, y: height - 230,
      size: 24, font: boldFont,
      color: rgb(0.83, 0.68, 0.21)
    })
    
    // Join date
    const joinDate = new Date(member.created_at).toLocaleDateString('en-LK', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    page.drawText(`Issued: ${joinDate}`, {
      x: 40, y: height - 260,
      size: 10, font: regularFont,
      color: rgb(0.4, 0.4, 0.4)
    })

    // aisca.lk watermark
    page.drawText('aisca.lk', {
      x: width - 80, y: 20,
      size: 9, font: regularFont,
      color: rgb(0.3, 0.3, 0.3)
    })
    
    const pdfBytes = await pdfDoc.save()
    
    // Upload to Supabase Storage
    const fileName = `membership-cards/${member.membership_number}.pdf`
    const { data, error } = await supabaseAdmin.storage
      .from('aisca-assets')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })
    
    if (error) {
      console.error(`Failed to upload membership card PDF to storage:`, error.message);
      return null;
    }
    
    const { data: urlData } = supabaseAdmin.storage
      .from('aisca-assets')
      .getPublicUrl(fileName)
    
    // Update member record with card URL
    const { error: updateError } = await supabaseAdmin
      .from('associate_members')
      .update({ membership_card_url: urlData.publicUrl })
      .eq('id', member.id)
      
    if (updateError) {
      console.error(`Failed to update associate_members with card URL:`, updateError.message);
    } else {
      console.log(`Successfully generated and linked membership card for ${member.full_name}: ${urlData.publicUrl}`);
    }
    
    return {
      publicUrl: urlData.publicUrl,
      pdfBytes: Buffer.from(pdfBytes)
    }
  } catch (err) {
    console.error("Error in generateMembershipCard:", err);
    return null;
  }
}
