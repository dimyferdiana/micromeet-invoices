import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { EmailSettingsCard } from "@/components/settings/EmailSettingsCard"
import { EmailTemplateCard } from "@/components/settings/EmailTemplateCard"
import { ReminderSettingsCard } from "@/components/settings/ReminderSettingsCard"
import { WatermarkSettingsCard } from "@/components/settings/WatermarkSettingsCard"
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
import {
  IconDeviceFloppy,
  IconCheck,
  IconPlus,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"
import { toast } from "sonner"

interface CompanyFormData {
  name: string
  address: string
  phone: string
  email: string
  website: string
  taxId: string
}

interface BankAccountFormData {
  bankName: string
  accountNumber: string
  accountHolder: string
  branch: string
  swiftCode: string
  isDefault: boolean
}

const defaultCompany: CompanyFormData = {
  name: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  taxId: "",
}

const defaultBankAccount: BankAccountFormData = {
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  branch: "",
  swiftCode: "",
  isDefault: false,
}

export function SettingsPage() {
  const companySettings = useQuery(api.companySettings.getWithUrls)
  const upsertSettings = useMutation(api.companySettings.upsert)

  const bankAccounts = useQuery(api.bankAccounts.list)
  const createBankAccount = useMutation(api.bankAccounts.create)
  const updateBankAccount = useMutation(api.bankAccounts.update)
  const deleteBankAccount = useMutation(api.bankAccounts.remove)
  const setDefaultBankAccount = useMutation(api.bankAccounts.setDefault)

  const updateCompanyLogo = useMutation(api.files.updateCompanyLogo)
  const removeCompanyLogo = useMutation(api.files.removeCompanyLogo)
  const updateCompanySignature = useMutation(api.files.updateCompanySignature)
  const removeCompanySignature = useMutation(api.files.removeCompanySignature)
  const updateCompanyStamp = useMutation(api.files.updateCompanyStamp)
  const removeCompanyStamp = useMutation(api.files.removeCompanyStamp)

  const [formData, setFormData] = useState<CompanyFormData>(defaultCompany)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Bank account dialog state
  const [bankDialogOpen, setBankDialogOpen] = useState(false)
  const [bankFormData, setBankFormData] = useState<BankAccountFormData>(defaultBankAccount)
  const [editingBankId, setEditingBankId] = useState<string | null>(null)
  const [deleteBankId, setDeleteBankId] = useState<string | null>(null)

  // Load existing settings
  useEffect(() => {
    if (companySettings) {
      setFormData({
        name: companySettings.name || "",
        address: companySettings.address || "",
        phone: companySettings.phone || "",
        email: companySettings.email || "",
        website: companySettings.website || "",
        taxId: companySettings.taxId || "",
      })
    }
  }, [companySettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await upsertSettings(formData)
      setSaveSuccess(true)
      toast.success("Pengaturan berhasil disimpan")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error("Gagal menyimpan pengaturan")
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Bank account handlers
  const handleOpenBankDialog = (account?: typeof bankAccounts extends (infer T)[] | undefined ? T : never) => {
    if (account) {
      setEditingBankId(account._id)
      setBankFormData({
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder,
        branch: account.branch || "",
        swiftCode: account.swiftCode || "",
        isDefault: account.isDefault,
      })
    } else {
      setEditingBankId(null)
      setBankFormData(defaultBankAccount)
    }
    setBankDialogOpen(true)
  }

  const handleSaveBankAccount = async () => {
    try {
      if (editingBankId) {
        await updateBankAccount({
          id: editingBankId as Id<"bankAccounts">,
          bankName: bankFormData.bankName,
          accountNumber: bankFormData.accountNumber,
          accountHolder: bankFormData.accountHolder,
          branch: bankFormData.branch || undefined,
          swiftCode: bankFormData.swiftCode || undefined,
          isDefault: bankFormData.isDefault,
        })
        toast.success("Rekening berhasil diperbarui")
      } else {
        await createBankAccount({
          bankName: bankFormData.bankName,
          accountNumber: bankFormData.accountNumber,
          accountHolder: bankFormData.accountHolder,
          branch: bankFormData.branch || undefined,
          swiftCode: bankFormData.swiftCode || undefined,
          isDefault: bankFormData.isDefault,
        })
        toast.success("Rekening berhasil ditambahkan")
      }
      setBankDialogOpen(false)
      setBankFormData(defaultBankAccount)
      setEditingBankId(null)
    } catch (error) {
      console.error("Failed to save bank account:", error)
      toast.error("Gagal menyimpan rekening")
    }
  }

  const handleDeleteBankAccount = async () => {
    if (deleteBankId) {
      try {
        await deleteBankAccount({ id: deleteBankId as Id<"bankAccounts"> })
        toast.success("Rekening berhasil dihapus")
      } catch (error) {
        console.error("Failed to delete bank account:", error)
        toast.error("Gagal menghapus rekening")
      }
      setDeleteBankId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultBankAccount({ id: id as Id<"bankAccounts"> })
      toast.success("Rekening utama berhasil diubah")
    } catch (error) {
      console.error("Failed to set default bank account:", error)
      toast.error("Gagal mengubah rekening utama")
    }
  }

  // File upload handlers
  const handleLogoUpload = async (storageId: string) => {
    await updateCompanyLogo({ logoFileId: storageId as Id<"_storage"> })
  }

  const handleLogoRemove = async () => {
    await removeCompanyLogo()
  }

  const handleSignatureUpload = async (storageId: string) => {
    await updateCompanySignature({ signatureFileId: storageId as Id<"_storage"> })
  }

  const handleSignatureRemove = async () => {
    await removeCompanySignature()
  }

  const handleStampUpload = async (storageId: string) => {
    await updateCompanyStamp({ stampFileId: storageId as Id<"_storage"> })
  }

  const handleStampRemove = async () => {
    await removeCompanyStamp()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi perusahaan yang akan digunakan pada dokumen
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Perusahaan</CardTitle>
            <CardDescription>
              Data ini akan otomatis digunakan saat membuat invoice, PO, atau kwitansi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Perusahaan *</Label>
                <Input
                  id="name"
                  placeholder="PT. Contoh Perusahaan"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat *</Label>
                <Textarea
                  id="address"
                  placeholder="Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12345"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    placeholder="021-12345678"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@perusahaan.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="www.perusahaan.com"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">NPWP</Label>
                  <Input
                    id="taxId"
                    placeholder="00.000.000.0-000.000"
                    value={formData.taxId}
                    onChange={(e) => updateField("taxId", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="w-40">
            {saveSuccess ? (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                Tersimpan!
              </>
            ) : isSaving ? (
              "Menyimpan..."
            ) : (
              <>
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Bank Accounts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rekening Bank</CardTitle>
              <CardDescription>
                Daftar rekening bank untuk pembayaran invoice
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenBankDialog()}>
              <IconPlus className="h-4 w-4 mr-2" />
              Tambah Rekening
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!bankAccounts || bankAccounts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada rekening bank. Tambahkan rekening pertama Anda.
            </p>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(account._id)}
                      className="text-yellow-500 hover:text-yellow-600"
                      title={account.isDefault ? "Rekening Utama" : "Jadikan Rekening Utama"}
                    >
                      {account.isDefault ? (
                        <IconStarFilled className="h-5 w-5" />
                      ) : (
                        <IconStar className="h-5 w-5" />
                      )}
                    </button>
                    <div>
                      <p className="font-medium">{account.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.accountNumber} • a.n. {account.accountHolder}
                      </p>
                      {account.branch && (
                        <p className="text-xs text-muted-foreground">
                          Cabang: {account.branch}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenBankDialog(account)}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteBankId(account._id)}
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

      {/* Branding Section */}
      <Card>
        <CardHeader>
          <CardTitle>Logo & Branding</CardTitle>
          <CardDescription>
            Upload logo perusahaan untuk ditampilkan pada dokumen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            currentImageUrl={companySettings?.logoUrl}
            onUpload={handleLogoUpload}
            onRemove={handleLogoRemove}
            label="Upload Logo"
            description="PNG, JPG atau SVG (max 2MB)"
          />
        </CardContent>
      </Card>

      {/* Signature & Stamp Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tanda Tangan & Stempel</CardTitle>
          <CardDescription>
            Upload tanda tangan dan stempel untuk ditampilkan pada dokumen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="mb-3 block">Tanda Tangan</Label>
              <FileUpload
                currentImageUrl={companySettings?.signatureUrl}
                onUpload={handleSignatureUpload}
                onRemove={handleSignatureRemove}
                label="Upload Tanda Tangan"
                description="PNG atau JPG dengan latar transparan"
              />
            </div>
            <div>
              <Label className="mb-3 block">Stempel Perusahaan</Label>
              <FileUpload
                currentImageUrl={companySettings?.stampUrl}
                onUpload={handleStampUpload}
                onRemove={handleStampRemove}
                label="Upload Stempel"
                description="PNG atau JPG dengan latar transparan"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watermark Settings Section */}
      <WatermarkSettingsCard />

      {/* Email Settings Section */}
      <EmailSettingsCard />

      {/* Email Template Section */}
      <EmailTemplateCard />

      {/* Auto-Reminder Section */}
      <ReminderSettingsCard />

      {/* Bank Account Dialog */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBankId ? "Edit Rekening Bank" : "Tambah Rekening Bank"}
            </DialogTitle>
            <DialogDescription>
              Masukkan informasi rekening bank Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank *</Label>
              <Input
                id="bankName"
                placeholder="Bank Central Asia"
                value={bankFormData.bankName}
                onChange={(e) =>
                  setBankFormData((prev) => ({ ...prev, bankName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening *</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890"
                value={bankFormData.accountNumber}
                onChange={(e) =>
                  setBankFormData((prev) => ({ ...prev, accountNumber: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolder">Atas Nama *</Label>
              <Input
                id="accountHolder"
                placeholder="PT. Contoh Perusahaan"
                value={bankFormData.accountHolder}
                onChange={(e) =>
                  setBankFormData((prev) => ({ ...prev, accountHolder: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Cabang</Label>
                <Input
                  id="branch"
                  placeholder="KCP Jakarta Selatan"
                  value={bankFormData.branch}
                  onChange={(e) =>
                    setBankFormData((prev) => ({ ...prev, branch: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  placeholder="CENAIDJA"
                  value={bankFormData.swiftCode}
                  onChange={(e) =>
                    setBankFormData((prev) => ({ ...prev, swiftCode: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={bankFormData.isDefault}
                onChange={(e) =>
                  setBankFormData((prev) => ({ ...prev, isDefault: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Jadikan sebagai rekening utama
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveBankAccount}
              disabled={!bankFormData.bankName || !bankFormData.accountNumber || !bankFormData.accountHolder}
            >
              {editingBankId ? "Simpan Perubahan" : "Tambah Rekening"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bank Account Confirmation */}
      <AlertDialog open={!!deleteBankId} onOpenChange={() => setDeleteBankId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rekening Bank?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Rekening bank akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBankAccount}
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
