import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const createInvitation = useMutation(api.invitations.create)

  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [isLoading, setIsLoading] = useState(false)

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Silakan masukkan email")
      return
    }

    setIsLoading(true)
    try {
      await createInvitation({ email: email.trim(), role })
      toast.success("Undangan berhasil dikirim")
      setEmail("")
      setRole("member")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim undangan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Undang Anggota Baru</DialogTitle>
          <DialogDescription>
            Kirim undangan via email untuk bergabung dengan organisasi Anda
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email *</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "member")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Anggota</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admin dapat mengelola anggota dan pengaturan. Anggota hanya dapat membuat dan mengelola dokumen sendiri.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleInvite} disabled={!email.trim() || isLoading}>
            {isLoading ? "Mengirim..." : "Kirim Undangan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
