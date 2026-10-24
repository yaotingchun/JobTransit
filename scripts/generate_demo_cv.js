import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function generateResumePdf() {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const { width, height } = page.getSize()
  let y = height - 48

  // Helper colors
  const darkNavy = rgb(0.08, 0.12, 0.22)
  const textDark = rgb(0.12, 0.16, 0.24)
  const textGray = rgb(0.35, 0.40, 0.48)
  const accentBlue = rgb(0.15, 0.38, 0.85)
  const lineGray = rgb(0.85, 0.88, 0.92)

  // 1. Header Banner
  page.drawText('ALEX CHEN', {
    x: 48,
    y,
    size: 24,
    font: fontBold,
    color: darkNavy,
  })

  y -= 18
  page.drawText('Software Engineer & AI Solutions Architect', {
    x: 48,
    y,
    size: 11,
    font: fontBold,
    color: accentBlue,
  })

  y -= 15
  const contactText = 'Kuala Lumpur, Malaysia  |  alex@gmail.com  |  +60 12-345 6789'
  page.drawText(contactText, {
    x: 48,
    y,
    size: 8.5,
    font: fontRegular,
    color: textGray,
  })

  y -= 12
  const linksText = 'LinkedIn: https://www.linkedin.com/in/asdrfdgreb  |  GitHub: https://github.com/asdrfdgreb'
  page.drawText(linksText, {
    x: 48,
    y,
    size: 8.5,
    font: fontRegular,
    color: accentBlue,
  })

  y -= 12
  page.drawLine({
    start: { x: 48, y },
    end: { x: width - 48, y },
    thickness: 1,
    color: lineGray,
  })

  y -= 18

  // Section helper
  const drawSectionHeading = (title) => {
    page.drawText(title.toUpperCase(), {
      x: 48,
      y,
      size: 10,
      font: fontBold,
      color: darkNavy,
    })
    y -= 4
    page.drawLine({
      start: { x: 48, y },
      end: { x: width - 48, y },
      thickness: 0.8,
      color: accentBlue,
    })
    y -= 14
  }

  // 2. Summary
  drawSectionHeading('Professional Summary')
  const summary = 'Innovative and analytical Software Engineer specializing in full-stack web applications, real-time cloud data systems, and machine learning integrations. Demonstrated capability in building scalable, production-grade applications with TypeScript, React, and Python.'
  page.drawText(summary, {
    x: 48,
    y,
    size: 8.5,
    font: fontRegular,
    color: textDark,
    maxWidth: width - 96,
    lineHeight: 12,
  })
  y -= 30

  // 3. Technical Skills
  drawSectionHeading('Skills & Competencies')
  page.drawText('Programming & Frameworks: ', { x: 48, y, size: 8.5, font: fontBold, color: textDark })
  page.drawText('React, TypeScript, JavaScript, Python, Node.js, Express, Tailwind CSS, SQL', { x: 190, y, size: 8.5, font: fontRegular, color: textDark })
  y -= 13

  page.drawText('Cloud & Databases: ', { x: 48, y, size: 8.5, font: fontBold, color: textDark })
  page.drawText('Firebase, Firestore, PostgreSQL, SQLite, RESTful APIs, Git, Docker', { x: 190, y, size: 8.5, font: fontRegular, color: textDark })
  y -= 13

  page.drawText('Core Competencies: ', { x: 48, y, size: 8.5, font: fontBold, color: textDark })
  page.drawText('Problem Solving, System Architecture, UI/UX Engineering, Agile Collaboration', { x: 190, y, size: 8.5, font: fontRegular, color: textDark })
  y -= 22

  // 4. Experience
  drawSectionHeading('Professional Experience')

  // Job 1
  page.drawText('Software Engineer', { x: 48, y, size: 9.5, font: fontBold, color: textDark })
  page.drawText('TransitAI Labs  |  Jan 2023 - Present', { x: 340, y, size: 8.5, font: fontRegular, color: textGray })
  y -= 12
  const bullets1 = [
    'Designed and deployed responsive web modules and real-time Firestore database synchronization.',
    'Engineered 3D WebGL interactive transit card visualizer boosting user engagement metrics by 42%.',
    'Optimized client-side bundle size and caching strategies, reducing initial application load by 1.8s.'
  ]
  bullets1.forEach(b => {
    page.drawText('•  ' + b, { x: 56, y, size: 8.2, font: fontRegular, color: textDark, maxWidth: width - 110, lineHeight: 11 })
    y -= 14
  })
  y -= 8

  // Job 2
  page.drawText('Frontend Developer Intern', { x: 48, y, size: 9.5, font: fontBold, color: textDark })
  page.drawText('Lexara Global  |  May 2021 - Dec 2022', { x: 340, y, size: 8.5, font: fontRegular, color: textGray })
  y -= 12
  const bullets2 = [
    'Constructed accessible UI components in React and TypeScript following modular design patterns.',
    'Integrated REST endpoints with client state management, cutting UI error state incidents by 28%.',
    'Collaborated closely with design and product teams to translate Figma prototypes into clean code.'
  ]
  bullets2.forEach(b => {
    page.drawText('•  ' + b, { x: 56, y, size: 8.2, font: fontRegular, color: textDark, maxWidth: width - 110, lineHeight: 11 })
    y -= 14
  })
  y -= 14

  // 5. Projects
  drawSectionHeading('Key Projects')

  page.drawText('JobTransit Career Route Engine  |  TypeScript, React, Firestore, Three.js', { x: 48, y, size: 9, font: fontBold, color: textDark })
  y -= 12
  page.drawText('•  Interactive 3D career travel pass generator with real-time multi-platform CV text parsing.', {
    x: 56, y, size: 8.2, font: fontRegular, color: textDark, maxWidth: width - 110
  })
  y -= 16

  page.drawText('Autonomous Skill Taxonomy Classifier  |  Python, FastAPI, Tesseract OCR', { x: 48, y, size: 9, font: fontBold, color: textDark })
  y -= 12
  page.drawText('•  Extracts and categorizes technical proficiencies across industry domains with 95% accuracy.', {
    x: 56, y, size: 8.2, font: fontRegular, color: textDark, maxWidth: width - 110
  })
  y -= 22

  // 6. Education
  drawSectionHeading('Education')
  page.drawText('Bachelor of Computer Science  |  Universiti Malaya', { x: 48, y, size: 9.5, font: fontBold, color: textDark })
  page.drawText('Graduated 2024', { x: 440, y, size: 8.5, font: fontRegular, color: textGray })
  y -= 12
  page.drawText('Dean\'s Honour List  •  Major: Software Engineering & Intelligent Systems', {
    x: 56, y, size: 8.2, font: fontRegular, color: textDark
  })

  const pdfBytes = await pdfDoc.save()
  const outPath = path.resolve('public', 'demo_alex_chen_resume.pdf')
  fs.writeFileSync(outPath, pdfBytes)
  console.log(`Demo CV generated successfully at ${outPath} (${pdfBytes.length} bytes)`)
}

generateResumePdf().catch(console.error)
