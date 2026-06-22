import CredentialsLogin from "./CredentialsLogin";
import GoogleLoginButton from "./GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="relative h-dvh w-full flex items-center justify-center overflow-hidden bg-bg-app text-text-primary selection:bg-accent-primary/30">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-tertiary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm px-8 py-10">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/25 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-inverse">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome back
          </h1>
          <p className="text-sm text-text-muted mt-1">Sign in to continue to CrewChat</p>
        </div>

        <CredentialsLogin />

        {/* Divider */}
        <div className="relative flex items-center justify-center gap-3 my-8">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider px-2">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        {/* Google OAuth */}
        <GoogleLoginButton />
      </div>
    </div>
  );
}
