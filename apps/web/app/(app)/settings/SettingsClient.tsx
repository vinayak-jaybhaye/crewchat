"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, Check, X, User, Palette, Lock, ShieldAlert } from "lucide-react";
import {
  enablePasswordAuthentication,
  disablePasswordAuthentication,
  updateUsername,
} from "@/lib/actions/account.actions";
import { useRouter } from "next/navigation";
import { UserDetailsDTO } from "@/lib/types/user.types";
import { useThemeStore } from "@/store/theme.store";
import { ProfilePic } from "@/components/user";

interface SettingsClientProps {
  user: UserDetailsDTO;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "security">("profile");
  const [loading, setLoading] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(user.passwordAuthenticationEnabled ?? false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const { mode, setTheme } = useThemeStore();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleTogglePasswordParams = async () => {
    if (passwordEnabled) {
      if (!confirm("Are you sure you want to disable password authentication?")) return;
      setLoading(true);
      try {
        await disablePasswordAuthentication();
        setPasswordEnabled(false);
      } catch (error) {
        console.error(error);
        alert("Failed to disable password authentication");
      } finally {
        setLoading(false);
      }
    } else {
      setShowPasswordInput(true);
    }
  };

  const confirmEnablePassword = async () => {
    if (!newPassword) return;
    const strength = getPasswordStrength(newPassword);
    if (strength.score < 2) {
      alert("Password is too weak. Please meet at least 2 requirements.");
      return;
    }
    setLoading(true);
    try {
      await enablePasswordAuthentication(newPassword);
      setPasswordEnabled(true);
      setShowPasswordInput(false);
      setNewPassword("");
    } catch (error) {
      console.error(error);
      alert("Failed to enable password authentication");
    } finally {
      setLoading(false);
    }
  };

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [usernameError, setUsernameError] = useState("");

  const handleUpdateUsername = async () => {
    setUsernameError("");
    if (usernameInput === user.username) {
      setIsEditingUsername(false);
      return;
    }

    if (usernameInput.length < 3) return setUsernameError("Min 3 characters");
    if (usernameInput.length > 20) return setUsernameError("Max 20 characters");
    if (!/^[a-zA-Z0-9_]+$/.test(usernameInput)) return setUsernameError("Alphanumeric & _ only");

    setLoading(true);
    try {
      const { success, message } = await updateUsername(usernameInput);
      if (!success) throw new Error(message);
      user.username = usernameInput;
      setIsEditingUsername(false);
      router.refresh();
    } catch (error: unknown) {
      setUsernameError(
        error instanceof Error ? error.message : "Failed to update username"
      );
    } finally {
      setLoading(false);
    }
  };

  const demoUser = user.email.endsWith("@example.com");

  function getPasswordStrength(password: string) {
    if (!password) return { score: 0, label: "None", color: "bg-bg-muted" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Medium", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  }

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Tabbed Selectors */}
      <div className="flex gap-1 bg-bg-app border border-border-subtle p-1 rounded-2xl shrink-0">
        {(["profile", "appearance", "security"] as const).map((tab) => {
          const Icon = tab === "profile" ? User : tab === "appearance" ? Palette : Lock;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? "bg-accent-primary text-text-inverse shadow-sm"
                  : "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-selected"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-surface-raised border border-border-subtle rounded-2xl p-6 shadow-sm min-h-[300px]">
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Profile details</h3>
              <p className="text-xs text-text-muted mt-0.5">Manage your public username and display details.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-bg-app/40 border border-border-subtle rounded-xl">
              <div className="rounded-full bg-bg-muted flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-border-subtle">
                <ProfilePic src={user.avatarUrl} name={user.username} size={72} />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Username</label>
                  {isEditingUsername ? (
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="w-full h-10 px-3 bg-surface-default border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/25 transition-all"
                          placeholder="Username"
                          disabled={loading}
                        />
                        {usernameError && (
                          <p className="text-xs text-error font-medium">{usernameError}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={handleUpdateUsername}
                          disabled={loading}
                          className="p-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-strong disabled:opacity-50 transition-all cursor-pointer hover:scale-105"
                          title="Save username"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingUsername(false);
                            setUsernameInput(user.username);
                            setUsernameError("");
                          }}
                          disabled={loading}
                          className="p-2 bg-bg-muted text-text-secondary rounded-lg hover:bg-bg-muted/75 hover:text-text-primary transition-all cursor-pointer hover:scale-105"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-surface-default border border-border-subtle rounded-lg">
                      <span className="text-sm font-semibold text-text-primary">{user.username}</span>
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        className="text-xs font-semibold text-accent-primary hover:text-accent-strong cursor-pointer hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Email address</label>
                  <div className="p-2.5 bg-surface-default/50 border border-border-subtle rounded-lg text-sm text-text-muted select-text">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Theme & Appearance</h3>
              <p className="text-xs text-text-muted mt-0.5">Customize how CrewChat looks on your device.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary">Select theme mode</label>
                <select
                  value={mode}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                  className="w-full max-w-xs h-11 px-3 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all cursor-pointer"
                >
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                  <option value="system">💻 System Default</option>
                </select>
              </div>

              <div className="p-4 bg-bg-app/40 border border-border-subtle rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Dynamic Accent</p>
                  <p className="text-xs text-text-muted">Accent colors adjust beautifully to match your choice.</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#4f46e5]" />
                  <span className="w-5 h-5 rounded-full bg-[#10b981]" />
                  <span className="w-5 h-5 rounded-full bg-[#a855f7]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Security & Account</h3>
              <p className="text-xs text-text-muted mt-0.5">Manage authentication settings and passwords.</p>
            </div>

            {demoUser && (
              <div className="flex gap-2.5 p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs leading-relaxed select-none">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <span>You are logged into a demo account. Password authentication adjustments are disabled.</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-bg-app/40 border border-border-subtle rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Password Login</p>
                  <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-0.5">
                    {passwordEnabled ? "Password authentication is enabled" : "Password authentication is disabled"}
                  </p>
                </div>

                {!showPasswordInput && (
                  <button
                    onClick={handleTogglePasswordParams}
                    disabled={loading || demoUser}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 ${
                      passwordEnabled
                        ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                        : "bg-accent-primary text-text-inverse hover:bg-accent-strong"
                    }`}
                  >
                    {passwordEnabled ? "Disable" : "Enable"}
                  </button>
                )}
              </div>

              {showPasswordInput && (
                <div className="p-4 bg-bg-app/40 border border-border-subtle rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Set a new password</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Choose password"
                        value={newPassword}
                        minLength={6}
                        maxLength={128}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 h-10 px-3 bg-surface-default border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/25 transition-all"
                      />
                      <button
                        onClick={confirmEnablePassword}
                        disabled={!newPassword || loading || strength.score < 2}
                        className="px-4 py-2 bg-accent-primary hover:bg-accent-strong disabled:opacity-40 text-text-inverse text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordInput(false);
                          setNewPassword("");
                        }}
                        className="px-4 py-2 bg-bg-muted hover:bg-bg-muted/75 text-text-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Password strength checklist */}
                  {newPassword && (
                    <div className="mt-2 space-y-2 p-3 bg-surface-default border border-border-subtle rounded-lg">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary">Password Strength:</span>
                        <span
                          className="font-bold transition-all duration-300"
                          style={{
                            color:
                              strength.score <= 1
                                ? "#ef4444"
                                : strength.score <= 3
                                ? "#f59e0b"
                                : "#10b981",
                          }}
                        >
                          {strength.label}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 h-1.5 w-full">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-bg-muted"}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-bg-muted"}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-bg-muted"}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.color : "bg-bg-muted"}`} />
                      </div>

                      <ul className="text-[11px] text-text-muted space-y-1.5 mt-2">
                        <li className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            newPassword.length >= 8
                              ? "bg-green-500/10 border-green-500/30 text-green-500"
                              : "border-border-strong text-text-muted"
                          }`}>
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            /[0-9]/.test(newPassword)
                              ? "bg-green-500/10 border-green-500/30 text-green-500"
                              : "border-border-strong text-text-muted"
                          }`}>
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          At least one number
                        </li>
                        <li className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            /[^A-Za-z0-9]/.test(newPassword)
                              ? "bg-green-500/10 border-green-500/30 text-green-500"
                              : "border-border-strong text-text-muted"
                          }`}>
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          At least one special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Account Sign Out Actions */}
      <section className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-4 rounded-xl transition-all font-semibold border border-red-500/20 hover:border-red-500/30 cursor-pointer shadow-sm active:scale-99"
        >
          <LogOut size={16} />
          Sign Out of Account
        </button>
      </section>
    </div>
  );
}