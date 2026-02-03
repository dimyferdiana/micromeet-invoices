/**
 * Print an HTML element
 * Uses the browser's native print functionality with print-specific CSS
 * @param elementId - The ID of the element to print (optional, prints whole page if not provided)
 */
export function printDocument(elementId?: string): void {
  if (elementId) {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with id "${elementId}" not found`)
      return
    }
    // Add print class to isolate the element
    element.classList.add("print-target")
  }

  window.print()

  if (elementId) {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.remove("print-target")
    }
  }
}
