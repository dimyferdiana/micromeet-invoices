import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react"
import type { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"

interface ProfileSettingsCardProps {
  profile: {
    _id: string
    name?: string
    email?: string
    image?: string
    hasPasswordAuth: boolean
    hasGoogleAuth: boolean
    authMethods: string[]
  } | null
}

export function ProfileSettingsCard({ profile }: ProfileSettingsCardProps) {
  const updateProfile = useMutation(api.users.updateProfile)
  const updateProfileImage = useMutation(api.files.updateProfileImage)
  const removeProfileImage = useMutation(api.files.removeProfileImage)

  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
    }
  }, [profile])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateProfile({ name })
      setSaveSuccess(true)
      toast.success("Profil berhasil disimpan")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast.error("Gagal menyimpan profil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (storageId: string) => {
    await updateProfileImage({ imageStorageId: storageId as Id<"_storage"> })
  }

  const handleImageRemove = async () => {
    await removeProfileImage()
  }

  if (!profile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Profil</CardTitle>
        <CardDescription>
          Kelola informasi akun pribadi Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="space-y-2">
          <Label>Foto Profil</Label>
          <FileUpload
            currentImageUrl={profile.image}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            label="Upload Foto"
            description="PNG atau JPG (max 2MB)"
            accept="image/png,image/jpeg"
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="profile-name">Nama</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            value={profile.email || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email tidak dapat diubah
          </p>
        </div>

        {/* Auth Method */}
        <div className="space-y-2">
          <Label>Metode Login</Label>
          <div className="flex gap-2">
            {profile.hasPasswordAuth && (
              <Badge variant="secondary">Password</Badge>
            )}
            {profile.hasGoogleAuth && (
              <Badge variant="secondary">Google</Badge>
            )}
          </div>
        </div>

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
                Simpan Profil
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
