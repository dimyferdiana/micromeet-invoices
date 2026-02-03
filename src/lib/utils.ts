import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number to Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date to Indonesian format
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

// Convert number to Indonesian words (Terbilang)
export function numberToWords(num: number): string {
  if (num === 0) return "Nol"

  const units = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ]

  const convert = (n: number): string => {
    if (n < 12) return units[n]
    if (n < 20) return units[n - 10] + " Belas"
    if (n < 100)
      return units[Math.floor(n / 10)] + " Puluh" + (n % 10 !== 0 ? " " + units[n % 10] : "")
    if (n < 200) return "Seratus" + (n % 100 !== 0 ? " " + convert(n % 100) : "")
    if (n < 1000)
      return units[Math.floor(n / 100)] + " Ratus" + (n % 100 !== 0 ? " " + convert(n % 100) : "")
    if (n < 2000) return "Seribu" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "")
    if (n < 1000000)
      return (
        convert(Math.floor(n / 1000)) + " Ribu" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "")
      )
    if (n < 1000000000)
      return (
        convert(Math.floor(n / 1000000)) +
        " Juta" +
        (n % 1000000 !== 0 ? " " + convert(n % 1000000) : "")
      )
    if (n < 1000000000000)
      return (
        convert(Math.floor(n / 1000000000)) +
        " Miliar" +
        (n % 1000000000 !== 0 ? " " + convert(n % 1000000000) : "")
      )
    return (
      convert(Math.floor(n / 1000000000000)) +
      " Triliun" +
      (n % 1000000000000 !== 0 ? " " + convert(n % 1000000000000) : "")
    )
  }

  return convert(Math.floor(num)) + " Rupiah"
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

// Get due date (30 days from today) in YYYY-MM-DD format
export function getDefaultDueDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().split("T")[0]
}
