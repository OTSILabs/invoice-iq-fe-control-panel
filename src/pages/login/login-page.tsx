
import { PageMetadata } from "@/components/layout/PageMetadata"
import { FileCheck2 } from "lucide-react";
import { LoginForm } from "./login-form";

export function LoginPage() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-6 md:p-10">
      <PageMetadata title="Login" description="Log in to your Invoice IQ control panel." keywords="login, authentication, invoice iq" />
      <div className="w-full max-w-95 flex flex-col items-center">
        {/* Simple Enterprise Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your Control Panel</p>
        </div>
        
        <LoginForm className="w-full" />
      </div>
    </div>
  )
}