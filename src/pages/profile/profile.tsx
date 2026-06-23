import { useState, useMemo } from "react"
import { Key, LogIn, Edit2, Shield, Mail, User, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthMe } from "@/api/hooks/useAuth"
import { getInitials, formatDate, getDecodedToken, formatRole } from "@/lib/utils"
import { ChangePasswordDialog } from "./change-password-dialog"
import { ActiveStatusBadge } from "@/columns"

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
    <div className="w-auto bg-slate-50/50 -m-2 sm:-m-4 lg:-m-8 p-4 sm:p-6 lg:p-8 space-y-6 animate-in duration-300 fade-in min-h-[calc(100vh-6.5rem)]">
      <PageHeader
        title="My Profile"
        description="Manage your account information, security settings, and audit activity."
        className="pb-4"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border border-slate-100 bg-white shadow-xs rounded-xl">
            <div className="h-32 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-slate-100/50 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
            </div>

            <div className="px-6 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 rounded-2xl border-4 border-white bg-white shadow-md">
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-3xl font-extrabold uppercase">{user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                </div>

                <div className="flex-1 min-w-0 sm:pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900 truncate">{user.name}</h2>
                    <ActiveStatusBadge status={user.status} className="hover:bg-emerald-100/50 text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize shadow-none" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>

                <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shadow-none">
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
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:border-slate-200 transition-colors duration-200">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white text-slate-500 shrink-0 shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-slate-100 bg-white shadow-xs rounded-xl">
            <CardHeader className="pb-3 border-b border-slate-100/80 bg-slate-50/20">
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">Account Security</CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">Manage your credentials and sign-in credentials.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password Last Changed</p>
                <p className="text-xs font-bold text-slate-700 mt-1">{user.pwdUpdated}</p>
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

          <Card className="border border-slate-100 bg-white shadow-xs rounded-xl">
            <CardHeader className="pb-3 border-b border-slate-100/80 bg-slate-50/20">
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="size-3.5 text-slate-400" /> Recent Activity
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">Your recent log-in and account modification events.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-5">
                {[
                  { title: "Successful Login", date: user.lastLogin, icon: <LogIn className="size-3" /> },
                  { title: "Password Updated", date: user.pwdUpdated, icon: <Key className="size-3" /> },
                ].map((item) => (
                  <div key={item.title} className="relative">
                    <span className="absolute -left-[26px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-500 shadow-2xs">{item.icon}</span>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-700">{item.title}</h5>
                      <p className="text-[10px] text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">View Full Activity</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChangePasswordDialog open={isChangingPassword} onOpenChange={setIsChangingPassword} />
    </div>
  )
}
