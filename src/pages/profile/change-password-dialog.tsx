import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Key, Eye, EyeOff, Check, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useChangePassword } from "@/api/hooks/useAuth"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
  DEFAULT_CHANGE_PASSWORD_VALUES,
} from "@/schemas/profile-schema"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { mutate: changePassword, isPending: isUpdatingPassword } = useChangePassword()

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Form handling
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULT_CHANGE_PASSWORD_VALUES,
  })

  const newPasswordValue = watch("new_password", "")

  // Password requirements checks
  const checks = {
    length: newPasswordValue.length >= 8,
    uppercase: /[A-Z]/.test(newPasswordValue),
    number: /[0-9]/.test(newPasswordValue),
    special: /[^A-Za-z0-9]/.test(newPasswordValue),
  }

  const onSubmitPassword = (data: ChangePasswordFormValues) => {
    changePassword(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          toast.success("Password changed successfully!")
          reset()
          onOpenChange(false)
        },
        onError: (err: any) => {
          const detail = err?.response?.data?.detail || err?.response?.data?.message || "Failed to update password"
          toast.error(detail)
        },
      }
    )
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset()
      onOpenChange(val)
    }}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Key className="size-5 text-primary" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Update your account security settings. Choose a secure password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitPassword)} className="flex flex-col max-h-[calc(85vh-5.5rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5 w-full">
                <Label htmlFor="current_password" className="text-sm font-medium text-foreground">
                  Current Password <span className="text-destructive ml-0.5">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="h-9 rounded-lg border border-input bg-inherit pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("current_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.current_password && (
                  <span className="px-1 text-[11px] font-medium text-destructive block mt-1">
                    {errors.current_password.message}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5 w-full">
                <Label htmlFor="new_password" className="text-sm font-medium text-foreground">
                  New Password <span className="text-destructive ml-0.5">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="h-9 rounded-lg border border-input bg-inherit pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("new_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.new_password && (
                  <span className="px-1 text-[11px] font-medium text-destructive block mt-1">
                    {errors.new_password.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 w-full">
                <Label htmlFor="confirm_password" className="text-sm font-medium text-foreground">
                  Confirm Password <span className="text-destructive ml-0.5">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="h-9 rounded-lg border border-input bg-inherit pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("confirm_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <span className="px-1 text-[11px] font-medium text-destructive block mt-1">
                    {errors.confirm_password.message}
                  </span>
                )}
              </div>

              {/* Password Requirements */}
              <div className="pt-2 space-y-2">
                <span className="text-xs font-semibold text-foreground">Password Requirements</span>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-center gap-1.5">
                    {checks.length ? (
                      <Check className="size-3.5 text-emerald-500 stroke-[3px]" />
                    ) : (
                      <span className="h-1.5 w-1.5 bg-slate-300 rounded-full ml-1.5 mr-1.5" />
                    )}
                    <span className={checks.length ? "text-slate-500 font-medium" : "text-slate-400"}>
                      Minimum 8 characters
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {checks.uppercase ? (
                      <Check className="size-3.5 text-emerald-500 stroke-[3px]" />
                    ) : (
                      <span className="h-1.5 w-1.5 bg-slate-300 rounded-full ml-1.5 mr-1.5" />
                    )}
                    <span className={checks.uppercase ? "text-slate-500 font-medium" : "text-slate-400"}>
                      One uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {checks.number ? (
                      <Check className="size-3.5 text-emerald-500 stroke-[3px]" />
                    ) : (
                      <span className="h-1.5 w-1.5 bg-slate-300 rounded-full ml-1.5 mr-1.5" />
                    )}
                    <span className={checks.number ? "text-slate-500 font-medium" : "text-slate-400"}>
                      One number
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {checks.special ? (
                      <Check className="size-3.5 text-emerald-500 stroke-[3px]" />
                    ) : (
                      <span className="h-1.5 w-1.5 bg-slate-300 rounded-full ml-1.5 mr-1.5" />
                    )}
                    <span className={checks.special ? "text-slate-500 font-medium" : "text-slate-400"}>
                      One special character
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollArea>

          {/* Dialog Footer Actions */}
          <DialogFooter className="gap-3 border-t border-border bg-popover px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingPassword}
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
            >
              {isUpdatingPassword && <RefreshCw className="mr-1.5 size-3.5 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
