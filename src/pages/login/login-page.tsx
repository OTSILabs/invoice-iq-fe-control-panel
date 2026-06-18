
import { FileCheck2 } from "lucide-react";
import { LoginForm } from "./login-form";

export function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-95 flex flex-col items-center">
        {/* Simple Enterprise Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary mb-6 shadow-sm">
            <FileCheck2 className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your Control Panel</p>
        </div>
        
        <LoginForm className="w-full" />
      </div>
    </div>
  )
}
