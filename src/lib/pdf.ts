import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { InvoiceFormData } from "./types"
import { formatCurrency, formatDate } from "./utils"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
}

/**
 * Load an image from URL and convert to base64
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Watermark options for PDF generation
 */
export interface WatermarkOptions {
  enabled: boolean
  text?: string // defaults to company name
  opacity?: number // 0-100, defaults to 10
}

/**
 * Draw watermark pattern on PDF
 */
function drawWatermark(doc: jsPDF, text: string, opacity: number = 10) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Save current state
  doc.saveGraphicsState()

  // Set text properties for watermark
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  // Convert opacity from 0-100 to 0-1 and set gray color
  const alpha = opacity / 100
  doc.setTextColor(180, 180, 180) // Light gray

  // Create diagonal pattern of repeating text
  const angle = -30 // Rotation angle in degrees
  const spacing = 60 // Spacing between watermark texts
  const textWidth = doc.getTextWidth(text)

  // Calculate how many rows and columns we need
  const diagonal = Math.sqrt(pageWidth * pageWidth + pageHeight * pageHeight)
  const cols = Math.ceil(diagonal / spacing) + 2
  const rows = Math.ceil(diagonal / spacing) + 2

  // Offset to cover entire page when rotated
  const offsetX = -pageWidth / 2
  const offsetY = -pageHeight / 2

  // Draw watermark pattern
  for (let row = -rows; row <= rows; row++) {
    for (let col = -cols; col <= cols; col++) {
      const x = pageWidth / 2 + col * spacing
      const y = pageHeight / 2 + row * spacing

      // Only draw if within page bounds (with some margin for rotation)
      if (x > -100 && x < pageWidth + 100 && y > -100 && y < pageHeight + 100) {
        // Save state, translate, rotate, draw, restore
        doc.saveGraphicsState()

        // Use text with rotation
        const radians = (angle * Math.PI) / 180
        const cos = Math.cos(radians)
        const sin = Math.sin(radians)

        // Transform matrix for rotation around (x, y)
        // Need to use internal methods for proper rotation
        const matrix = [cos, sin, -sin, cos, x, y]

        // Apply transformation manually using internal API
        doc.internal.write(
          `q ${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${x.toFixed(2)} ${(pageHeight - y).toFixed(2)} cm`
        )

        // Draw text at origin (transformation moves it to correct position)
        doc.internal.write(
          `BT /F1 12 Tf ${(alpha * 100).toFixed(0)} Tr 0 0 Td (${text.replace(/[()\\]/g, "\\$&")}) Tj ET`
        )

        doc.internal.write("Q")

        doc.restoreGraphicsState()
      }
    }
  }

  doc.restoreGraphicsState()
}

/**
 * Simpler watermark approach using built-in text method
 */
function drawSimpleWatermark(doc: jsPDF, text: string, opacity: number = 10) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Set text properties for watermark
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  // Light gray with low opacity effect
  const grayValue = 220 - Math.round((opacity / 100) * 70) // 220-150 range
  doc.setTextColor(grayValue, grayValue, grayValue)

  // Create diagonal pattern of repeating text
  const spacingX = 80
  const spacingY = 40

  // Draw watermark pattern
  for (let y = 10; y < pageHeight + 50; y += spacingY) {
    for (let x = -50; x < pageWidth + 50; x += spacingX) {
      // Offset every other row for pattern effect
      const offsetX = (Math.floor(y / spacingY) % 2) * (spacingX / 2)
      doc.text(text, x + offsetX, y, { angle: -30 })
    }
  }
}

/**
 * Generate a PDF invoice and return as base64 string
 */
export async function generateInvoicePdfBase64(
  data: InvoiceFormData,
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
    branch?: string
  },
  logoUrl?: string,
  watermark?: WatermarkOptions
): Promise<string> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = margin

  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229] // Indigo
  const textColor: [number, number, number] = [31, 41, 55]
  const mutedColor: [number, number, number] = [107, 114, 128]

  // Draw watermark if enabled (before content so it appears behind)
  if (watermark?.enabled) {
    const watermarkText = watermark.text || data.company.name
    const watermarkOpacity = watermark.opacity ?? 10
    drawSimpleWatermark(doc, watermarkText, watermarkOpacity)
  }

  // Helper function to add text
  const addText = (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number
      fontStyle?: "normal" | "bold"
      color?: [number, number, number]
      align?: "left" | "center" | "right"
    }
  ) => {
    const {
      fontSize = 10,
      fontStyle = "normal",
      color = textColor,
      align = "left",
    } = options || {}
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", fontStyle)
    doc.setTextColor(...color)
    doc.text(text, x, y, { align })
  }

  // Header - Logo and INVOICE title
  let logoWidth = 0

  if (logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(logoUrl)
      if (logoBase64) {
        // Add logo with max height of 16mm
        const logoMaxHeight = 16
        const logoMaxWidth = 40

        // Create an image element to get dimensions
        const img = new Image()
        img.src = logoBase64

        await new Promise<void>((resolve) => {
          img.onload = () => {
            const aspectRatio = img.width / img.height
            let imgWidth = logoMaxHeight * aspectRatio
            let imgHeight = logoMaxHeight

            if (imgWidth > logoMaxWidth) {
              imgWidth = logoMaxWidth
              imgHeight = logoMaxWidth / aspectRatio
            }

            doc.addImage(logoBase64, "PNG", margin, yPos - 4, imgWidth, imgHeight)
            logoWidth = imgWidth + 5
            resolve()
          }
          img.onerror = () => resolve()
        })
      }
    } catch (e) {
      console.error("Failed to load logo:", e)
    }
  }

  addText("INVOICE", margin + logoWidth, yPos, {
    fontSize: 28,
    fontStyle: "bold",
    color: primaryColor,
  })

  // Invoice number
  yPos += 10
  addText(data.invoiceNumber, margin + logoWidth, yPos, {
    fontSize: 14,
    fontStyle: "bold",
  })

  // Status badge on the right
  const statusText =
    data.status === "paid"
      ? "LUNAS"
      : data.status === "sent"
        ? "TERKIRIM"
        : data.status === "overdue"
          ? "JATUH TEMPO"
          : data.status === "cancelled"
            ? "DIBATALKAN"
            : "DRAFT"

  const statusColor: [number, number, number] =
    data.status === "paid"
      ? [34, 197, 94]
      : data.status === "overdue"
        ? [239, 68, 68]
        : [107, 114, 128]

  addText(statusText, pageWidth - margin, yPos - 10, {
    fontSize: 12,
    fontStyle: "bold",
    color: statusColor,
    align: "right",
  })

  // Company and Customer info - side by side
  yPos += 15
  const infoStartY = yPos
  const leftColWidth = (pageWidth - margin * 2) / 2 - 5
  const rightColX = margin + leftColWidth + 10

  // FROM section (left side)
  addText("DARI", margin, yPos, {
    fontSize: 9,
    fontStyle: "bold",
    color: mutedColor,
  })
  yPos += 6
  addText(data.company.name, margin, yPos, { fontSize: 12, fontStyle: "bold" })
  yPos += 6

  // Wrap company address to fit in left column
  const companyAddressLines = doc.splitTextToSize(data.company.address, leftColWidth)
  for (const line of companyAddressLines) {
    addText(line, margin, yPos, { fontSize: 9, color: mutedColor })
    yPos += 4
  }

  if (data.company.phone) {
    addText(`Tel: ${data.company.phone}`, margin, yPos, {
      fontSize: 9,
      color: mutedColor,
    })
    yPos += 4
  }
  if (data.company.email) {
    addText(`Email: ${data.company.email}`, margin, yPos, {
      fontSize: 9,
      color: mutedColor,
    })
    yPos += 4
  }
  if (data.company.taxId) {
    addText(`NPWP: ${data.company.taxId}`, margin, yPos, {
      fontSize: 9,
      color: mutedColor,
    })
    yPos += 4
  }

  const leftColEndY = yPos

  // TO section (right side) - start from same Y position
  let rightYPos = infoStartY

  addText("KEPADA", rightColX, rightYPos, {
    fontSize: 9,
    fontStyle: "bold",
    color: mutedColor,
  })
  rightYPos += 6
  addText(data.customer.name, rightColX, rightYPos, {
    fontSize: 12,
    fontStyle: "bold",
  })
  rightYPos += 6

  // Wrap customer address to fit in right column
  const customerAddressLines = doc.splitTextToSize(data.customer.address, leftColWidth)
  for (const line of customerAddressLines) {
    addText(line, rightColX, rightYPos, { fontSize: 9, color: mutedColor })
    rightYPos += 4
  }

  if (data.customer.phone) {
    addText(`Tel: ${data.customer.phone}`, rightColX, rightYPos, {
      fontSize: 9,
      color: mutedColor,
    })
    rightYPos += 4
  }
  if (data.customer.email) {
    addText(`Email: ${data.customer.email}`, rightColX, rightYPos, {
      fontSize: 9,
      color: mutedColor,
    })
    rightYPos += 4
  }

  // Continue from the lowest point
  yPos = Math.max(leftColEndY, rightYPos) + 10

  addText("TANGGAL INVOICE", margin, yPos, {
    fontSize: 9,
    fontStyle: "bold",
    color: mutedColor,
  })
  addText("JATUH TEMPO", rightColX, yPos, {
    fontSize: 9,
    fontStyle: "bold",
    color: mutedColor,
  })

  yPos += 5
  addText(formatDate(data.date), margin, yPos, { fontSize: 10 })
  addText(formatDate(data.dueDate), rightColX, yPos, { fontSize: 10 })

  // Items table
  yPos += 15

  const tableData = data.items.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.amount),
  ])

  autoTable(doc, {
    startY: yPos,
    head: [["Deskripsi", "Qty", "Harga Satuan", "Jumlah"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55],
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
    margin: { left: margin, right: margin },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  })

  // Totals
  yPos = doc.lastAutoTable.finalY + 10
  const totalsX = pageWidth - margin - 80

  addText("Subtotal", totalsX, yPos, { fontSize: 9, color: mutedColor })
  addText(formatCurrency(data.subtotal), pageWidth - margin, yPos, {
    fontSize: 10,
    align: "right",
  })

  yPos += 6
  addText(`Pajak (${data.taxRate}%)`, totalsX, yPos, {
    fontSize: 9,
    color: mutedColor,
  })
  addText(formatCurrency(data.taxAmount), pageWidth - margin, yPos, {
    fontSize: 10,
    align: "right",
  })

  yPos += 8
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(totalsX, yPos, pageWidth - margin, yPos)

  yPos += 6
  addText("Total", totalsX, yPos, { fontSize: 12, fontStyle: "bold" })
  addText(formatCurrency(data.total), pageWidth - margin, yPos, {
    fontSize: 12,
    fontStyle: "bold",
    align: "right",
  })

  // Bank account info
  if (bankAccount) {
    yPos += 15
    const bankInfoStartY = yPos
    const labelWidth = 30
    const valueStartX = margin + 5 + labelWidth

    // Calculate height needed for bank info box
    let bankInfoHeight = 8 + 6 + 6 + 6 // header + 3 rows minimum
    if (bankAccount.branch) {
      const branchLines = doc.splitTextToSize(
        bankAccount.branch,
        pageWidth - margin * 2 - labelWidth - 10
      )
      bankInfoHeight += (branchLines.length - 1) * 4
    }

    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, bankInfoHeight + 8, 3, 3, "F")

    yPos += 8
    addText("INFORMASI PEMBAYARAN", margin + 5, yPos, {
      fontSize: 9,
      fontStyle: "bold",
      color: mutedColor,
    })

    yPos += 6
    addText("Bank:", margin + 5, yPos, { fontSize: 9, color: mutedColor })
    addText(bankAccount.bankName, valueStartX, yPos, { fontSize: 9 })

    yPos += 5
    addText("No. Rekening:", margin + 5, yPos, { fontSize: 9, color: mutedColor })
    addText(bankAccount.accountNumber, valueStartX, yPos, { fontSize: 9 })

    yPos += 5
    addText("Atas Nama:", margin + 5, yPos, { fontSize: 9, color: mutedColor })
    addText(bankAccount.accountHolder, valueStartX, yPos, { fontSize: 9 })

    if (bankAccount.branch) {
      yPos += 5
      addText("Cabang:", margin + 5, yPos, { fontSize: 9, color: mutedColor })
      // Wrap long branch names
      const branchLines = doc.splitTextToSize(
        bankAccount.branch,
        pageWidth - margin * 2 - labelWidth - 10
      )
      for (const line of branchLines) {
        addText(line, valueStartX, yPos, { fontSize: 9 })
        yPos += 4
      }
      yPos -= 4 // Adjust for last increment
    }

    yPos = bankInfoStartY + bankInfoHeight + 8
  }

  // Notes
  if (data.notes) {
    yPos += bankAccount ? 20 : 15
    addText("CATATAN", margin, yPos, {
      fontSize: 9,
      fontStyle: "bold",
      color: mutedColor,
    })
    yPos += 5

    const noteLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2)
    for (const line of noteLines) {
      addText(line, margin, yPos, { fontSize: 9, color: mutedColor })
      yPos += 4
    }
  }

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.2)
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5)

  addText("Terima kasih atas kepercayaan Anda", pageWidth / 2, yPos, {
    fontSize: 9,
    color: mutedColor,
    align: "center",
  })

  // Return as base64
  const pdfOutput = doc.output("datauristring")
  // Remove the data URI prefix
  const base64 = pdfOutput.split(",")[1]
  return base64
}

/**
 * Download invoice PDF
 */
export async function downloadInvoicePdf(
  data: InvoiceFormData,
  filename: string,
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
    branch?: string
  },
  logoUrl?: string,
  watermark?: WatermarkOptions
): Promise<void> {
  const base64 = await generateInvoicePdfBase64(data, bankAccount, logoUrl, watermark)

  // Create blob and download
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: "application/pdf" })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Legacy function for backward compatibility (now uses jsPDF)
export async function generatePdfBase64(_elementId: string): Promise<string> {
  console.warn(
    "generatePdfBase64 with elementId is deprecated. Use generateInvoicePdfBase64 instead."
  )
  throw new Error(
    "Please use generateInvoicePdfBase64 with invoice data instead of element ID"
  )
}

export async function downloadPdf(
  _elementId: string,
  _filename: string
): Promise<void> {
  console.warn(
    "downloadPdf with elementId is deprecated. Use downloadInvoicePdf instead."
  )
  throw new Error(
    "Please use downloadInvoicePdf with invoice data instead of element ID"
  )
}
