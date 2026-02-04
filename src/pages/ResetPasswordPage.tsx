import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconLoader2, IconFileInvoice, IconCheck, IconX } from "@tabler/icons-react"
import { toast } from "sonner"

interface ResetPasswordPageProps {
  token: string
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function ResetPasswordPage({ token, onSuccess, onSwitchToLogin }: ResetPasswordPageProps) {
  const verifyToken = useMutation(api.passwordReset.verifyToken)
  const resetPassword = useMutation(api.passwordReset.resetPassword)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      try {
        const result = await verifyToken({ token })
        if (result.valid) {
          setIsTokenValid(true)
        } else {
          setTokenError(result.error || "Token tidak valid")
        }
      } catch (error) {
        setTokenError("Gagal memverifikasi token")
      } finally {
        setIsVerifying(false)
      }
    }
    verify()
  }, [token, verifyToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error("Silakan isi semua field")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama")
      return
    }

    if (password.length < 8) {
      toast.error("Password minimal 8 karakter")
      return
    }

    setIsLoading(true)
    try {
      await resetPassword({ token, newPassword: password })
      setIsSuccess(true)
      toast.success("Password berhasil diubah!")
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.message || "Gagal mengubah password")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <IconLoader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Memverifikasi link reset...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if token is invalid
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <IconX className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Link Tidak Valid</CardTitle>
            <CardDescription>{tokenError}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Link reset password mungkin sudah kedaluwarsa atau sudah digunakan.
              Silakan minta link reset baru.
            </p>
            <Button className="w-full" onClick={onSwitchToLogin}>
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show success message
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <IconCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Password Berhasil Diubah</CardTitle>
            <CardDescription>
              Password Anda telah berhasil diperbarui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Silakan login dengan password baru Anda.
            </p>
            <Button className="w-full" onClick={onSuccess}>
              Masuk Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <IconFileInvoice className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Masukkan password baru untuk akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ubah Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
