import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react"
import type { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"

type TemplateType = "invoice" | "purchaseOrder" | "both"

interface TemplateFormData {
  name: string
  content: string
  type: TemplateType
  isDefault: boolean
}

const defaultFormData: TemplateFormData = {
  name: "",
  content: "",
  type: "both",
  isDefault: false,
}

const typeLabels: Record<TemplateType, string> = {
  invoice: "Invoice",
  purchaseOrder: "Purchase Order",
  both: "Semua",
}

const typeBadgeColors: Record<TemplateType, string> = {
  invoice: "bg-blue-100 text-blue-800",
  purchaseOrder: "bg-purple-100 text-purple-800",
  both: "bg-green-100 text-green-800",
}

export function TermsTemplatesCard() {
  const templates = useQuery(api.termsTemplates.list, {})
  const createTemplate = useMutation(api.termsTemplates.create)
  const updateTemplate = useMutation(api.termsTemplates.update)
  const deleteTemplate = useMutation(api.termsTemplates.remove)
  const setDefaultTemplate = useMutation(api.termsTemplates.setDefault)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleOpenDialog = (template?: NonNullable<typeof templates>[number]) => {
    if (template) {
      setEditingId(template._id)
      setFormData({
        name: template.name,
        content: template.content,
        type: template.type,
        isDefault: template.isDefault,
      })
    } else {
      setEditingId(null)
      setFormData(defaultFormData)
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Nama dan isi template harus diisi")
      return
    }

    try {
      if (editingId) {
        await updateTemplate({
          id: editingId as Id<"termsTemplates">,
          name: formData.name,
          content: formData.content,
          type: formData.type,
          isDefault: formData.isDefault,
        })
        toast.success("Template berhasil diperbarui")
      } else {
        await createTemplate({
          name: formData.name,
          content: formData.content,
          type: formData.type,
          isDefault: formData.isDefault,
        })
        toast.success("Template berhasil ditambahkan")
      }
      setDialogOpen(false)
      setFormData(defaultFormData)
      setEditingId(null)
    } catch (error) {
      console.error("Failed to save template:", error)
      toast.error("Gagal menyimpan template")
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteTemplate({ id: deleteId as Id<"termsTemplates"> })
        toast.success("Template berhasil dihapus")
      } catch (error) {
        console.error("Failed to delete template:", error)
        toast.error("Gagal menghapus template")
      }
      setDeleteId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultTemplate({ id: id as Id<"termsTemplates"> })
      toast.success("Template default berhasil diubah")
    } catch (error) {
      console.error("Failed to set default template:", error)
      toast.error("Gagal mengubah template default")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Syarat & Ketentuan</CardTitle>
              <CardDescription>
                Template syarat & ketentuan yang dapat digunakan pada Invoice dan Purchase Order
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <IconPlus className="h-4 w-4 mr-2" />
              Tambah Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!templates || templates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada template. Tambahkan template pertama Anda.
            </p>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(template._id)}
                      className="text-yellow-500 hover:text-yellow-600 mt-0.5"
                      title={template.isDefault ? "Template Default" : "Jadikan Default"}
                    >
                      {template.isDefault ? (
                        <IconStarFilled className="h-5 w-5" />
                      ) : (
                        <IconStar className="h-5 w-5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{template.name}</p>
                        <Badge variant="secondary" className={typeBadgeColors[template.type]}>
                          {typeLabels[template.type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {template.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(template)}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(template._id)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Template" : "Tambah Template"}
            </DialogTitle>
            <DialogDescription>
              Buat template syarat & ketentuan untuk digunakan pada dokumen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nama Template *</Label>
              <Input
                id="template-name"
                placeholder="Contoh: Syarat Standar, Net 30, dll."
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-type">Digunakan Untuk *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TemplateType) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Semua (Invoice & PO)</SelectItem>
                  <SelectItem value="invoice">Invoice saja</SelectItem>
                  <SelectItem value="purchaseOrder">Purchase Order saja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Isi Syarat & Ketentuan *</Label>
              <Textarea
                id="template-content"
                placeholder="Masukkan syarat & ketentuan..."
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="template-isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="template-isDefault" className="text-sm font-normal">
                Jadikan sebagai template default
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.content.trim()}
            >
              {editingId ? "Simpan Perubahan" : "Tambah Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Template syarat & ketentuan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
