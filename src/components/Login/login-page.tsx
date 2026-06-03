import { LoginForm } from "../login-form";

export function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        {/* Simple Enterprise Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 mb-6 shadow-sm">
            <span className="text-white font-bold text-lg tracking-tighter">IQ</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your Control Panel</p>
        </div>
        
        <LoginForm className="w-full" />
      </div>
    </div>
  )
}
