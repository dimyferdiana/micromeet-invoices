import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconLoader2, IconFileInvoice, IconArrowLeft, IconCheck } from "@tabler/icons-react"
import { toast } from "sonner"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

interface ForgotPasswordPageProps {
  onSwitchToLogin: () => void
}

export function ForgotPasswordPage({ onSwitchToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const requestPasswordReset = useMutation(api.passwordReset.requestReset)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Silakan masukkan email Anda")
      return
    }

    setIsLoading(true)
    try {
      await requestPasswordReset({ email })
      setIsEmailSent(true)
      toast.success("Link reset password telah dikirim ke email Anda")
    } catch (error: any) {
      console.error("Password reset error:", error)
      // Don't reveal if email exists or not for security
      setIsEmailSent(true)
      toast.success("Jika email terdaftar, link reset password akan dikirim")
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl">Lupa Password</CardTitle>
          <CardDescription>
            {isEmailSent
              ? "Periksa email Anda untuk link reset password"
              : "Masukkan email Anda untuk menerima link reset password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEmailSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <IconCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Jika email <strong>{email}</strong> terdaftar di sistem kami, Anda akan menerima
                link reset password dalam beberapa menit.
              </p>
              <p className="text-sm text-muted-foreground">
                Link reset password berlaku selama 1 jam.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSwitchToLogin}
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onSwitchToLogin}
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
