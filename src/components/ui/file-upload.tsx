import { useState, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react"
import { toast } from "sonner"

interface FileUploadProps {
  currentImageUrl?: string | null
  onUpload: (storageId: string) => Promise<void>
  onRemove: () => Promise<void>
  accept?: string
  maxSizeMB?: number
  label?: string
  description?: string
  className?: string
}

export function FileUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  accept = "image/png,image/jpeg,image/svg+xml",
  maxSizeMB = 2,
  label = "Upload File",
  description = "PNG, JPG atau SVG (max 2MB)",
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = accept.split(",").map((t) => t.trim())
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipe file tidak didukung")
      return
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`Ukuran file maksimal ${maxSizeMB}MB`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    try {
      const uploadUrl = await generateUploadUrl()

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { storageId } = await response.json()
      await onUpload(storageId)
      toast.success("File berhasil diupload")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Gagal mengupload file")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = async () => {
    try {
      await onRemove()
      setPreviewUrl(null)
      toast.success("File berhasil dihapus")
    } catch (error) {
      console.error("Remove error:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const displayUrl = previewUrl || currentImageUrl

  return (
    <div className={cn("space-y-3", className)}>
      {displayUrl ? (
        <div className="relative inline-block">
          <img
            src={displayUrl}
            alt="Preview"
            className="max-h-32 max-w-48 rounded-lg border object-contain bg-white p-2"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <IconX className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconPhoto className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!displayUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <IconUpload className="h-4 w-4 mr-2" />
          {isUploading ? "Mengupload..." : "Pilih File"}
        </Button>
      )}
    </div>
  )
}
