import { useState, useEffect } from "react"
import { useConvexAuth, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { Sidebar, type ActiveView } from "@/components/layout/Sidebar"
import { BottomTabBar } from "@/components/layout/BottomTabBar"
import { Toaster } from "@/components/ui/sonner"
import { DashboardPage } from "@/pages/DashboardPage"
import { InvoicesPage } from "@/pages/InvoicesPage"
import { PurchaseOrdersPage } from "@/pages/PurchaseOrdersPage"
import { ReceiptsPage } from "@/pages/ReceiptsPage"
import { CustomersPage } from "@/pages/CustomersPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage"
import { ResetPasswordPage } from "@/pages/ResetPasswordPage"
import { AcceptInvitationPage } from "@/pages/AcceptInvitationPage"
import { useAuth } from "@/hooks/useAuth"
import { IconLoader2 } from "@tabler/icons-react"

type AuthView = "login" | "register" | "forgot-password" | "reset-password"

export function App() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth()
  const { user, isLoading: isUserLoading } = useAuth()
  const createOrganization = useMutation(api.users.createOrganizationForUser)

  const [activeView, setActiveView] = useState<ActiveView>("dashboard")
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<string | undefined>(undefined)
  const [authView, setAuthView] = useState<AuthView>("login")
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [showInvitationAuth, setShowInvitationAuth] = useState(false)
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)

  const handleNavigateToProfile = () => {
    setSettingsDefaultTab("profile")
    setActiveView("settings")
  }

  const handleViewChange = (view: ActiveView) => {
    if (view !== "settings") {
      setSettingsDefaultTab(undefined)
    }
    setActiveView(view)
  }

  // Check for reset token or invitation token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const resetTkn = params.get("resetToken")
    const inviteTkn = params.get("invitationToken")
    if (resetTkn) {
      setResetToken(resetTkn)
      setAuthView("reset-password")
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    if (inviteTkn) {
      setInvitationToken(inviteTkn)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Create organization for new users (skip if accepting an invitation)
  useEffect(() => {
    async function ensureOrganization() {
      if (invitationToken) return
      if (isAuthenticated && user && !user.organizationId && !isCreatingOrg) {
        setIsCreatingOrg(true)
        try {
          await createOrganization()
        } catch (error) {
          console.error("Failed to create organization:", error)
        } finally {
          setIsCreatingOrg(false)
        }
      }
    }
    ensureOrganization()
  }, [isAuthenticated, user, createOrganization, isCreatingOrg, invitationToken])

  // Show loading while checking auth
  if (isAuthLoading || (isAuthenticated && isUserLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  // Show reset password page if token is present (even if not authenticated)
  if (resetToken && authView === "reset-password") {
    return (
      <>
        <ResetPasswordPage
          token={resetToken}
          onSuccess={() => {
            setResetToken(null)
            setAuthView("login")
          }}
          onSwitchToLogin={() => {
            setResetToken(null)
            setAuthView("login")
          }}
        />
        <Toaster position="top-right" richColors />
      </>
    )
  }

  // Show invitation acceptance page if token is present
  if (invitationToken && (isAuthenticated || !showInvitationAuth)) {
    return (
      <>
        <AcceptInvitationPage
          token={invitationToken}
          onSuccess={() => {
            setInvitationToken(null)
            setShowInvitationAuth(false)
            setActiveView("dashboard")
          }}
          onSwitchToLogin={() => {
            setShowInvitationAuth(true)
            setAuthView("login")
          }}
          onSwitchToRegister={() => {
            setShowInvitationAuth(true)
            setAuthView("register")
          }}
        />
        <Toaster position="top-right" richColors />
      </>
    )
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {authView === "login" && (
          <LoginPage
            onSwitchToRegister={() => setAuthView("register")}
            onSwitchToForgotPassword={() => setAuthView("forgot-password")}
          />
        )}
        {authView === "register" && (
          <RegisterPage onSwitchToLogin={() => setAuthView("login")} />
        )}
        {authView === "forgot-password" && (
          <ForgotPasswordPage onSwitchToLogin={() => setAuthView("login")} />
        )}
        <Toaster position="top-right" richColors />
      </>
    )
  }

  // Show loading while creating organization (skip if accepting invitation)
  if (!invitationToken && (isCreatingOrg || (user && !user.organizationId))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Menyiapkan akun Anda...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardPage />
      case "invoices":
        return <InvoicesPage />
      case "purchase-orders":
        return <PurchaseOrdersPage />
      case "receipts":
        return <ReceiptsPage />
      case "customers":
        return <CustomersPage />
      case "settings":
        return <SettingsPage defaultTab={settingsDefaultTab} />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile, visible on tablet/desktop, hidden when printing */}
      <div className="print:hidden">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} user={user} onNavigateToProfile={handleNavigateToProfile} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 pb-20 md:p-6 lg:p-8">{renderContent()}</div>
      </main>

      {/* Bottom Tab Bar - visible on mobile only, hidden on tablet/desktop and when printing */}
      <div className="md:hidden">
        <BottomTabBar activeView={activeView} onViewChange={handleViewChange} user={user} onNavigateToProfile={handleNavigateToProfile} />
      </div>

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
