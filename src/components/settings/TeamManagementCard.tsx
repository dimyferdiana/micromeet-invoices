import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { InviteMemberDialog } from "./InviteMemberDialog"
import { IconPlus, IconTrash, IconUser, IconMail, IconX } from "@tabler/icons-react"
import { useAuth } from "@/hooks/useAuth"
import type { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"

export function TeamManagementCard() {
  const { user } = useAuth()
  const members = useQuery(api.members.list)
  const pendingInvitations = useQuery(api.invitations.listPending)

  const updateRole = useMutation(api.members.updateRole)
  const removeMember = useMutation(api.members.remove)
  const cancelInvitation = useMutation(api.invitations.cancel)
  const resendInvitation = useMutation(api.invitations.resend)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)
  const [removeMemberName, setRemoveMemberName] = useState("")

  const canManage = user?.role === "owner" || user?.role === "admin"

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await updateRole({
        memberId: memberId as Id<"organizationMembers">,
        role: newRole as "admin" | "member",
      })
      toast.success("Role anggota berhasil diubah")
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah role anggota")
    }
  }

  const handleRemoveMember = async () => {
    if (!removeMemberId) return
    try {
      await removeMember({ memberId: removeMemberId as Id<"organizationMembers"> })
      toast.success("Anggota berhasil dihapus")
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus anggota")
    }
    setRemoveMemberId(null)
    setRemoveMemberName("")
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation({ invitationId: invitationId as Id<"invitations"> })
      toast.success("Undangan berhasil dibatalkan")
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan undangan")
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation({ invitationId: invitationId as Id<"invitations"> })
      toast.success("Undangan berhasil dikirim ulang")
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim ulang undangan")
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner": return "Pemilik"
      case "admin": return "Admin"
      case "member": return "Anggota"
      default: return role
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Tim</CardTitle>
              <CardDescription>
                Kelola anggota dan undangan tim Anda
              </CardDescription>
            </div>
            {canManage && (
              <Button onClick={() => setInviteDialogOpen(true)} className="w-full sm:w-auto">
                <IconPlus className="h-4 w-4 mr-2" />
                Undang Anggota
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Members Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Anggota Aktif ({members?.length ?? 0})
            </h3>
            {!members || members.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada anggota.
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-8 w-8 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <IconUser className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="text-muted-foreground text-sm font-normal"> (Anda)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {member.role === "owner" ? (
                      <Badge>Pemilik</Badge>
                    ) : canManage ? (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(val) => handleChangeRole(member._id, val)}
                        >
                          <SelectTrigger className="w-30 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Anggota</SelectItem>
                          </SelectContent>
                        </Select>
                        {!member.isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setRemoveMemberId(member._id)
                              setRemoveMemberName(member.name)
                            }}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary">{getRoleLabel(member.role)}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pending Invitations Section */}
          {pendingInvitations && pendingInvitations.length > 0 && (
            <div className="pt-6 border-t space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Undangan Menunggu ({pendingInvitations.length})
              </h3>
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-dashed rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <IconMail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Diundang oleh {invitation.invitedByName} sebagai{" "}
                        {invitation.role === "admin" ? "Admin" : "Anggota"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 shrink-0">
                      Menunggu
                    </Badge>
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvitation(invitation._id)}
                        >
                          Kirim Ulang
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleCancelInvitation(invitation._id)}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{removeMemberName}</strong> dari organisasi?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
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
