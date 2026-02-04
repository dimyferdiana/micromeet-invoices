import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconEdit, IconTrash, IconMail, IconPhone } from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"

interface CustomerFormData {
  name: string
  address: string
  phone: string
  email: string
  notes: string
}

const defaultCustomer: CustomerFormData = {
  name: "",
  address: "",
  phone: "",
  email: "",
  notes: "",
}

export function CustomersPage() {
  const customers = useQuery(api.customers.list)
  const createCustomer = useMutation(api.customers.create)
  const updateCustomer = useMutation(api.customers.update)
  const deleteCustomer = useMutation(api.customers.remove)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(defaultCustomer)
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenCreate = () => {
    setFormData(defaultCustomer)
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (customer: {
    _id: string
    name: string
    address: string
    phone?: string
    email?: string
    notes?: string
  }) => {
    setFormData({
      name: customer.name,
      address: customer.address,
      phone: customer.phone || "",
      email: customer.email || "",
      notes: customer.notes || "",
    })
    setEditingId(customer._id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingId) {
        await updateCustomer({
          id: editingId as Id<"customers">,
          ...formData,
        })
      } else {
        await createCustomer(formData)
      }
      setIsDialogOpen(false)
      setFormData(defaultCustomer)
      setEditingId(null)
    } catch (error) {
      console.error("Failed to save customer:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCustomer({ id: deleteId as Id<"customers"> })
      setDeleteId(null)
    }
  }

  return (
    <div>
      <Header
        title="Pelanggan"
        subtitle="Kelola data pelanggan dan vendor"
        onCreateNew={handleOpenCreate}
        createLabel="Tambah Pelanggan"
      />

      {customers?.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada data pelanggan. Tambahkan pelanggan pertama Anda!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {customers?.map((customer) => (
            <Card key={customer._id} className="p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-base md:text-lg truncate">{customer.name}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {customer.address}
                  </p>
                  <div className="mt-3 space-y-1">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <IconPhone className="h-4 w-4 shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <IconMail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(customer)} className="touch-target">
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive touch-target"
                    onClick={() => setDeleteId(customer._id)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi pelanggan"
                : "Isi informasi pelanggan yang akan ditambahkan"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama *</Label>
              <Input
                id="name"
                placeholder="Nama pelanggan atau perusahaan"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat *</Label>
              <Textarea
                id="address"
                placeholder="Alamat lengkap"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  placeholder="08xx-xxxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data pelanggan akan dihapus secara permanen.
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
    </div>
  )
}
