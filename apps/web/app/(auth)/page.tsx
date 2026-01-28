import CredentialsLogin from "./CredentialsLogin";
import GoogleLoginButton from "./GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="relative h-dvh w-full flex items-center justify-center overflow-hidden bg-bg-app text-text-primary selection:bg-accent-primary/30">
      <div className="relative w-full max-w-sm px-8 py-10">
        <CredentialsLogin />

        {/* Divider */}
        <div className="relative flex items-center justify-center gap-3 my-8">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Google OAuth */}
        <GoogleLoginButton />
      </div>
    </div>
  );
}
