import { useState, useMemo } from "react"
import { Key, LogIn, Edit2, Shield, Mail, User, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthMe } from "@/api/hooks/useAuth"
import { getInitials, formatDate, getDecodedToken, formatRole } from "@/lib/utils"
import { ChangePasswordDialog } from "./change-password-dialog"

import { PageHeader } from "@/components/layout/PageHeader"

const INITIAL_TIME = Date.now()

export function Profile() {
  const { data: profile } = useAuthMe()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const jwt = useMemo(() => getDecodedToken() || {}, [])

  const user = useMemo(() => {
    const name = profile?.full_name || profile?.name || jwt.name || jwt.username || jwt.email?.split("@")[0] || "Bodi"
    const pwdDate = formatDate(jwt.pwd || INITIAL_TIME).split(",")[0]
    return {
      name,
      email: profile?.email || jwt.email || "admin@control-plane.local",
      role: formatRole(profile?.role_name || profile?.role || jwt.roles || jwt.role || jwt.app_metadata?.role || "global_admin"),
      status: profile?.status || "ACTIVE",
      initials: getInitials(name) || "B",
      id: profile?.id || jwt.sub || "1",
      lastLogin: formatDate(jwt.iat ? jwt.iat * 1000 : INITIAL_TIME),
      pwdUpdated: pwdDate,
      memberSince: pwdDate,
    }
  }, [profile, jwt])

  return (
    <div className="w-auto p-0 space-y-6 animate-in duration-300 fade-in">
      <PageHeader
        title="My Profile"
        description="Manage your account information, security settings, and audit activity."
        className="pb-4"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border border-border bg-card shadow-sm rounded-xl">
            <div className="h-32 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50 relative">
              <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
            </div>

            <div className="px-6 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 rounded-2xl border-4 border-card bg-card shadow-md">
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-3xl font-extrabold uppercase">{user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-emerald-500 shadow-sm" />
                </div>

                <div className="flex-1 min-w-0 sm:pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-foreground truncate">{user.name}</h2>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize shadow-none">{user.status.toLowerCase()}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>

                <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-1.5 border-border text-foreground hover:bg-muted cursor-pointer shadow-none">
                  <Edit2 className="size-3.5" /> Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  { label: "Role", value: user.role, icon: Shield },
                  { label: "Email Address", value: user.email, icon: Mail },
                  { label: "Member Since", value: user.memberSince, icon: Calendar },
                  { label: "Account ID", value: user.id, icon: User },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:border-border/80 transition-colors duration-200">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-card text-muted-foreground shrink-0 shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-bold text-foreground truncate mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-border bg-card shadow-sm rounded-xl">
            <CardHeader className="pb-3 border-b border-border/80 bg-muted/15">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">Account Security</CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">Manage your credentials and sign-in credentials.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Password Last Changed</p>
                <p className="text-xs font-bold text-foreground mt-1">{user.pwdUpdated}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                className="w-full h-8 text-xs font-semibold gap-1.5 border-primary/20 hover:bg-primary/10 text-primary bg-primary/5 cursor-pointer shadow-none"
              >
                <Key className="size-3.5" /> Change Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-sm rounded-xl">
            <CardHeader className="pb-3 border-b border-border/80 bg-muted/15">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground" /> Recent Activity
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">Your recent log-in and account modification events.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative border-l border-border pl-4 ml-2 space-y-5">
                {[
                  { title: "Successful Login", date: user.lastLogin, icon: <LogIn className="size-3" /> },
                  { title: "Password Updated", date: user.pwdUpdated, icon: <Key className="size-3" /> },
                ].map((item) => (
                  <div key={item.title} className="relative">
                    <span className="absolute -left-[26px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border text-muted-foreground shadow-2xs">{item.icon}</span>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-foreground">{item.title}</h5>
                      <p className="text-[10px] text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-border flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">View Full Activity</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChangePasswordDialog open={isChangingPassword} onOpenChange={setIsChangingPassword} />
    </div>
  )
}
