import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react"
import { toast } from "sonner"

interface OrganizationSettingsCardProps {
  organization: { _id: string; name: string } | null
  role: string | null
}

export function OrganizationSettingsCard({ organization, role }: OrganizationSettingsCardProps) {
  const updateOrgName = useMutation(api.users.updateOrganizationName)

  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const canEdit = role === "owner"

  useEffect(() => {
    if (organization) {
      setName(organization.name)
    }
  }, [organization])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama organisasi tidak boleh kosong")
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateOrgName({ name })
      setSaveSuccess(true)
      toast.success("Nama organisasi berhasil diubah")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to update organization:", error)
      toast.error("Gagal mengubah nama organisasi")
    } finally {
      setIsSaving(false)
    }
  }

  if (!organization) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisasi</CardTitle>
        <CardDescription>
          Pengaturan organisasi Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-name">Nama Organisasi</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Organisasi"
            disabled={!canEdit}
            className={!canEdit ? "bg-muted" : ""}
          />
          {!canEdit && (
            <p className="text-xs text-muted-foreground">
              Hanya pemilik yang dapat mengubah nama organisasi
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="w-40">
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
                  Simpan
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
