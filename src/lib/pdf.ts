import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { InvoiceFormData, POFormData, ReceiptFormData } from "./types"
import { formatCurrency, formatDate, numberToWords } from "./utils"
import { paymentMethodLabels } from "./types"

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

/**
 * Generate a PDF for Purchase Order and return as base64 string
 */
export async function generatePOPdfBase64(
  data: POFormData,
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

  // Draw watermark if enabled
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

  // Header - Logo and PO title
  let logoWidth = 0

  if (logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(logoUrl)
      if (logoBase64) {
        const logoMaxHeight = 16
        const logoMaxWidth = 40

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

  addText("PURCHASE ORDER", margin + logoWidth, yPos, {
    fontSize: 24,
    fontStyle: "bold",
    color: primaryColor,
  })

  // PO number
  yPos += 10
  addText(data.poNumber, margin + logoWidth, yPos, {
    fontSize: 14,
    fontStyle: "bold",
  })

  // Status badge
  const statusText =
    data.status === "received"
      ? "DITERIMA"
      : data.status === "confirmed"
        ? "DIKONFIRMASI"
        : data.status === "sent"
          ? "TERKIRIM"
          : data.status === "cancelled"
            ? "DIBATALKAN"
            : "DRAFT"

  const statusColor: [number, number, number] =
    data.status === "received"
      ? [34, 197, 94]
      : data.status === "confirmed"
        ? [124, 58, 237]
        : [107, 114, 128]

  addText(statusText, pageWidth - margin, yPos - 10, {
    fontSize: 12,
    fontStyle: "bold",
    color: statusColor,
    align: "right",
  })

  // Company and Vendor info
  yPos += 15
  const infoStartY = yPos
  const leftColWidth = (pageWidth - margin * 2) / 2 - 5
  const rightColX = margin + leftColWidth + 10

  // FROM section
  addText("DARI", margin, yPos, {
    fontSize: 9,
    fontStyle: "bold",
    color: mutedColor,
  })
  yPos += 6
  addText(data.company.name, margin, yPos, { fontSize: 12, fontStyle: "bold" })
  yPos += 6

  const companyAddressLines = doc.splitTextToSize(data.company.address, leftColWidth)
  for (const line of companyAddressLines) {
    addText(line, margin, yPos, { fontSize: 9, color: mutedColor })
    yPos += 4
  }

  if (data.company.phone) {
    addText(`Tel: ${data.company.phone}`, margin, yPos, { fontSize: 9, color: mutedColor })
    yPos += 4
  }
  if (data.company.email) {
    addText(`Email: ${data.company.email}`, margin, yPos, { fontSize: 9, color: mutedColor })
    yPos += 4
  }

  const leftColEndY = yPos

  // VENDOR section
  let rightYPos = infoStartY

  addText("KEPADA (VENDOR)", rightColX, rightYPos, {
    fontSize: 9,
    fontStyle: "bold",
    color: mutedColor,
  })
  rightYPos += 6
  addText(data.vendor.name, rightColX, rightYPos, { fontSize: 12, fontStyle: "bold" })
  rightYPos += 6

  const vendorAddressLines = doc.splitTextToSize(data.vendor.address, leftColWidth)
  for (const line of vendorAddressLines) {
    addText(line, rightColX, rightYPos, { fontSize: 9, color: mutedColor })
    rightYPos += 4
  }

  if (data.vendor.phone) {
    addText(`Tel: ${data.vendor.phone}`, rightColX, rightYPos, { fontSize: 9, color: mutedColor })
    rightYPos += 4
  }
  if (data.vendor.email) {
    addText(`Email: ${data.vendor.email}`, rightColX, rightYPos, { fontSize: 9, color: mutedColor })
    rightYPos += 4
  }

  yPos = Math.max(leftColEndY, rightYPos) + 10

  // Dates
  addText("TANGGAL PO", margin, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
  if (data.expectedDeliveryDate) {
    addText("ESTIMASI PENGIRIMAN", rightColX, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
  }

  yPos += 5
  addText(formatDate(data.date), margin, yPos, { fontSize: 10 })
  if (data.expectedDeliveryDate) {
    addText(formatDate(data.expectedDeliveryDate), rightColX, yPos, { fontSize: 10 })
  }

  // Shipping address if available
  if (data.shippingAddress) {
    yPos += 10
    addText("ALAMAT PENGIRIMAN", margin, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
    yPos += 5
    const shippingLines = doc.splitTextToSize(data.shippingAddress, pageWidth - margin * 2)
    for (const line of shippingLines) {
      addText(line, margin, yPos, { fontSize: 9 })
      yPos += 4
    }
  }

  // Items table
  yPos += 10

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
  addText(formatCurrency(data.subtotal), pageWidth - margin, yPos, { fontSize: 10, align: "right" })

  yPos += 6
  addText(`Pajak (${data.taxRate}%)`, totalsX, yPos, { fontSize: 9, color: mutedColor })
  addText(formatCurrency(data.taxAmount), pageWidth - margin, yPos, { fontSize: 10, align: "right" })

  yPos += 8
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(totalsX, yPos, pageWidth - margin, yPos)

  yPos += 6
  addText("Total", totalsX, yPos, { fontSize: 12, fontStyle: "bold" })
  addText(formatCurrency(data.total), pageWidth - margin, yPos, { fontSize: 12, fontStyle: "bold", align: "right" })

  // Terms and conditions
  if (data.terms) {
    yPos += 15
    addText("SYARAT & KETENTUAN", margin, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
    yPos += 5
    const termsLines = doc.splitTextToSize(data.terms, pageWidth - margin * 2)
    for (const line of termsLines) {
      addText(line, margin, yPos, { fontSize: 9, color: mutedColor })
      yPos += 4
    }
  }

  // Notes
  if (data.notes) {
    yPos += 10
    addText("CATATAN", margin, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
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

  addText("Terima kasih atas kerjasama Anda", pageWidth / 2, yPos, {
    fontSize: 9,
    color: mutedColor,
    align: "center",
  })

  // Return as base64
  const pdfOutput = doc.output("datauristring")
  const base64 = pdfOutput.split(",")[1]
  return base64
}

/**
 * Download Purchase Order PDF
 */
export async function downloadPOPdf(
  data: POFormData,
  filename: string,
  logoUrl?: string,
  watermark?: WatermarkOptions
): Promise<void> {
  const base64 = await generatePOPdfBase64(data, logoUrl, watermark)

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

/**
 * Generate a PDF for Receipt and return as base64 string
 */
export async function generateReceiptPdfBase64(
  data: ReceiptFormData,
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

  // Draw watermark if enabled
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

  // Header - Logo and KWITANSI title
  let logoWidth = 0

  if (logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(logoUrl)
      if (logoBase64) {
        const logoMaxHeight = 16
        const logoMaxWidth = 40

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

  addText("KWITANSI", margin + logoWidth, yPos, {
    fontSize: 28,
    fontStyle: "bold",
    color: primaryColor,
  })

  // Receipt number
  yPos += 10
  addText(data.receiptNumber, margin + logoWidth, yPos, {
    fontSize: 14,
    fontStyle: "bold",
  })

  // Date on the right
  addText(formatDate(data.date), pageWidth - margin, yPos, {
    fontSize: 10,
    align: "right",
  })

  // Company info
  yPos += 15
  addText(data.company.name, margin, yPos, { fontSize: 12, fontStyle: "bold" })
  yPos += 6

  const companyAddressLines = doc.splitTextToSize(data.company.address, pageWidth - margin * 2)
  for (const line of companyAddressLines) {
    addText(line, margin, yPos, { fontSize: 9, color: mutedColor })
    yPos += 4
  }

  if (data.company.phone) {
    addText(`Tel: ${data.company.phone}`, margin, yPos, { fontSize: 9, color: mutedColor })
    yPos += 4
  }

  // Receipt content box
  yPos += 10
  const boxStartY = yPos
  const contentHeight = 90

  doc.setFillColor(249, 250, 251)
  doc.roundedRect(margin, boxStartY, pageWidth - margin * 2, contentHeight, 3, 3, "F")

  yPos = boxStartY + 12

  // "Sudah terima dari" or "Sudah kirim kepada" based on mode
  const receiveFromLabel = data.mode === "send" ? "Sudah kirim kepada:" : "Sudah terima dari:"
  addText(receiveFromLabel, margin + 10, yPos, { fontSize: 10, color: mutedColor })
  yPos += 8
  addText(data.receivedFrom, margin + 10, yPos, { fontSize: 14, fontStyle: "bold" })

  // Amount
  yPos += 15
  addText("Uang sejumlah:", margin + 10, yPos, { fontSize: 10, color: mutedColor })
  yPos += 8
  addText(formatCurrency(data.amount), margin + 10, yPos, {
    fontSize: 18,
    fontStyle: "bold",
    color: primaryColor,
  })

  // Amount in words
  yPos += 10
  const amountInWordsText = data.amountInWords || numberToWords(data.amount)
  const wordsLines = doc.splitTextToSize(`(${amountInWordsText})`, pageWidth - margin * 2 - 20)
  for (const line of wordsLines) {
    addText(line, margin + 10, yPos, { fontSize: 9, fontStyle: "bold" })
    yPos += 4
  }

  // Payment details section
  yPos = boxStartY + contentHeight + 15

  // Payment for
  addText("UNTUK PEMBAYARAN", margin, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
  yPos += 6
  const paymentForLines = doc.splitTextToSize(data.paymentFor, pageWidth - margin * 2)
  for (const line of paymentForLines) {
    addText(line, margin, yPos, { fontSize: 10 })
    yPos += 5
  }

  // Payment method
  yPos += 8
  addText("METODE PEMBAYARAN", margin, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
  yPos += 6
  addText(paymentMethodLabels[data.paymentMethod], margin, yPos, { fontSize: 10 })

  // Notes
  if (data.notes) {
    yPos += 12
    addText("CATATAN", margin, yPos, { fontSize: 9, fontStyle: "bold", color: mutedColor })
    yPos += 5
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2)
    for (const line of noteLines) {
      addText(line, margin, yPos, { fontSize: 9, color: mutedColor })
      yPos += 4
    }
  }

  // Signature area
  yPos += 20
  const sigBoxWidth = 70
  const sigBoxX = pageWidth - margin - sigBoxWidth

  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.5)
  doc.line(sigBoxX, yPos + 30, sigBoxX + sigBoxWidth, yPos + 30)

  const signatureLabel = data.mode === "send" ? "Pengirim," : "Penerima,"
  addText(signatureLabel, sigBoxX, yPos, { fontSize: 9, color: mutedColor })
  addText(data.company.name, sigBoxX + sigBoxWidth / 2, yPos + 38, { fontSize: 9, align: "center" })

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.2)
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5)

  addText("Kwitansi ini sah sebagai bukti pembayaran", pageWidth / 2, yPos, {
    fontSize: 9,
    color: mutedColor,
    align: "center",
  })

  // Return as base64
  const pdfOutput = doc.output("datauristring")
  const base64 = pdfOutput.split(",")[1]
  return base64
}

/**
 * Download Receipt PDF
 */
export async function downloadReceiptPdf(
  data: ReceiptFormData,
  filename: string,
  logoUrl?: string,
  watermark?: WatermarkOptions
): Promise<void> {
  const base64 = await generateReceiptPdfBase64(data, logoUrl, watermark)

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
