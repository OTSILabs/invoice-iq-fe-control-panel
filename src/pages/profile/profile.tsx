import React, { useState } from "react"
import { Key, LogIn, Edit2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthMe } from "@/api/hooks/useAuth"
import { getInitials, formatDate, getDecodedToken, formatRole } from "@/lib/utils"
import { ChangePasswordDialog } from "./change-password-dialog"
const INITIAL_TIME = Date.now()

export function Profile() {
  const { data: profile } = useAuthMe()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const jwt = React.useMemo(() => getDecodedToken() || {}, [])

  const user = React.useMemo(() => {
    const name = profile?.full_name || profile?.name || jwt.name || jwt.username || jwt.email?.split("@")[0] || "Bodi"
    return {
      name,
      email: profile?.email || jwt.email || "admin@control-plane.local",
      role: formatRole(profile?.role_name || profile?.role || jwt.roles || jwt.role || jwt.app_metadata?.role || "global_admin"),
      status: profile?.status || "ACTIVE",
      initials: getInitials(name) || "B",
      id: profile?.id || jwt.sub || "1",
      lastLogin: formatDate(jwt.iat ? jwt.iat * 1000 : INITIAL_TIME),
      pwdUpdated: formatDate(jwt.pwd || INITIAL_TIME).split(",")[0],
      memberSince: formatDate(jwt.pwd || INITIAL_TIME).split(",")[0],
    }
  }, [profile, jwt])

  return (
    <div className="w-auto bg-white -m-2 sm:-m-4 lg:-m-8 p-4 sm:p-6 lg:p-8 space-y-6 animate-in duration-200 fade-in min-h-[calc(100vh-6.5rem)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900">My Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your account information, security settings, and account activity.</p>
        </div>

        {/* Profile Information Section */}
        <div className="space-y-4 mt-4">
          <h2 className="text-sm font-bold text-slate-950">Profile Information</h2>
          <div className="flex flex-col items-start gap-4 py-1">
            <div className="relative">
              <Avatar className="h-20 w-20 rounded-full border border-slate-200 bg-slate-50">
                <AvatarFallback className="rounded-full bg-primary/10 text-primary text-2xl font-semibold">{user.initials}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="w-full space-y-2.5 mt-1">
              {[
                { label: "Full Name", value: user.name },
                { label: "Email", value: user.email },
                { label: "Role", value: user.role },
                { label: "Status", value: <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-md capitalize">{user.status.toLowerCase()}</Badge> },
                { label: "Member Since", value: user.memberSince },
                { label: "User ID", value: user.id },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 py-1.5 border-b border-slate-100 text-xs items-center">
                  <span className="text-slate-400 font-medium">{row.label}</span>
                  <span className="col-span-2 text-slate-700 font-semibold truncate">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="w-full flex justify-end pt-1">
              <Button variant="outline" size="sm" className="h-7 text-xs font-medium gap-1.5 border-slate-200 text-slate-600">
                <Edit2 className="size-3" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 my-1" />

        {/* Account Security Section */}
        <div className="space-y-4 mt-2">
          <h2 className="text-sm font-bold text-slate-955">Account Security</h2>
          <div className="flex justify-between items-center gap-4 py-1">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password Last Updated</h4>
              <p className="text-xs font-semibold text-slate-700 mt-1">{user.pwdUpdated}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)} className="h-7 text-xs font-semibold gap-1.5 border-primary/20 hover:bg-primary/10 text-primary bg-primary/5">
              <Key className="size-3" /> Change Password
            </Button>
          </div>
        </div>

        <hr className="border-slate-100 my-1" />

        {/* Recent Activity Section */}
        <div className="space-y-4 mt-2">
          <h2 className="text-sm font-bold text-slate-955">Recent Activity</h2>
          <div className="py-1 space-y-4">
            <div className="relative border-l border-slate-100 pl-6 space-y-4">
              {[
                { title: "Successful Login", date: user.lastLogin, icon: <LogIn className="size-2" /> },
                { title: "Password Updated", date: user.pwdUpdated, icon: <Key className="size-2" /> },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary/5 border border-primary/20 text-primary">{item.icon}</span>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-semibold text-slate-700">{item.title}</h5>
                    <p className="text-[10px] text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Full Activity */}
      <div className="w-full flex justify-end pt-2 border-t border-slate-100 mt-4">
        <Button variant="outline" size="sm" className="h-7 text-xs font-medium border-slate-200 text-slate-600">View Full Activity</Button>
      </div>

      <ChangePasswordDialog open={isChangingPassword} onOpenChange={setIsChangingPassword} />
    </div>
  )
}
