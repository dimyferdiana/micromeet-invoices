import { useState } from "react"
import { useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconLock, IconCheck } from "@tabler/icons-react"
import { toast } from "sonner"

interface ChangePasswordCardProps {
  hasPasswordAuth: boolean
}

export function ChangePasswordCard({ hasPasswordAuth }: ChangePasswordCardProps) {
  const changePassword = useAction(api.profileActions.changePassword)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (!hasPasswordAuth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
          <CardDescription>Pengaturan keamanan akun</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Akun Anda terhubung melalui Google. Password dikelola oleh Google.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }

    setIsLoading(true)
    setSaveSuccess(false)

    try {
      await changePassword({ currentPassword, newPassword })
      setSaveSuccess(true)
      toast.success("Password berhasil diubah")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      if (error?.message?.includes("Password saat ini salah")) {
        toast.error("Password saat ini salah")
      } else {
        toast.error("Gagal mengubah password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>Perbarui password akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Password Saat Ini</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Minimal 6 karakter
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-40">
              {saveSuccess ? (
                <>
                  <IconCheck className="h-4 w-4 mr-2" />
                  Berhasil!
                </>
              ) : isLoading ? (
                "Memproses..."
              ) : (
                <>
                  <IconLock className="h-4 w-4 mr-2" />
                  Ubah Password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
