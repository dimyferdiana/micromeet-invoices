import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { useConvexAuth } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconLoader2, IconCheck, IconX, IconUserPlus } from "@tabler/icons-react"
import { toast } from "sonner"

interface AcceptInvitationPageProps {
  token: string
  onSuccess: () => void
  onSwitchToLogin: () => void
  onSwitchToRegister: () => void
}

export function AcceptInvitationPage({
  token,
  onSuccess,
  onSwitchToLogin,
  onSwitchToRegister,
}: AcceptInvitationPageProps) {
  const { isAuthenticated } = useConvexAuth()
  const tokenInfo = useQuery(api.invitations.verifyToken, { token })
  const acceptInvitation = useMutation(api.invitations.accept)

  const [isAccepting, setIsAccepting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)

  const isVerifying = tokenInfo === undefined
  const isTokenValid = tokenInfo?.valid === true

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      const result = await acceptInvitation({ token })
      if (result.alreadyMember) {
        toast.success("Anda sudah menjadi anggota organisasi ini")
      } else {
        toast.success("Berhasil bergabung dengan organisasi!")
      }
      setIsAccepted(true)
    } catch (error: any) {
      toast.error(error.message || "Gagal menerima undangan")
    } finally {
      setIsAccepting(false)
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
              <p className="text-muted-foreground">Memverifikasi undangan...</p>
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
            <CardTitle className="text-2xl">Undangan Tidak Valid</CardTitle>
            <CardDescription>
              {tokenInfo && !tokenInfo.valid ? tokenInfo.error : "Token undangan tidak valid"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Undangan mungkin sudah kedaluwarsa, dibatalkan, atau sudah digunakan.
              Silakan minta undangan baru dari admin organisasi.
            </p>
            <Button className="w-full" onClick={onSwitchToLogin}>
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show success after accepting
  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <IconCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Berhasil Bergabung!</CardTitle>
            <CardDescription>
              Anda telah bergabung dengan {tokenInfo.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={onSuccess}>
              Masuk ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Token is valid - show invitation details
  const roleLabel = tokenInfo.role === "admin" ? "Admin" : "Anggota"

  // If authenticated, show accept button
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <IconUserPlus className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Undangan Bergabung</CardTitle>
            <CardDescription>
              Anda diundang untuk bergabung dengan organisasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-center">
              <p className="text-lg font-semibold">{tokenInfo.organizationName}</p>
              <div className="flex justify-center">
                <Badge variant="secondary">Sebagai {roleLabel}</Badge>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Terima Undangan"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated - show login/register prompt
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <IconUserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Undangan Bergabung</CardTitle>
          <CardDescription>
            Anda diundang untuk bergabung dengan organisasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-center">
            <p className="text-lg font-semibold">{tokenInfo.organizationName}</p>
            <div className="flex justify-center">
              <Badge variant="secondary">Sebagai {roleLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Undangan untuk: <strong>{tokenInfo.email}</strong>
            </p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Silakan login atau daftar terlebih dahulu untuk menerima undangan ini.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onSwitchToLogin}>
              Masuk
            </Button>
            <Button onClick={onSwitchToRegister}>
              Daftar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
