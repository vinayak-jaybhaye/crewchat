"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, Check } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(user.passwordAuthenticationEnabled ?? false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const { mode, setTheme } = useThemeStore();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" });
  };

  const handleTogglePasswordParams = async () => {
    if (passwordEnabled) {
      // Disable
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
      // Enable - Show Input
      setShowPasswordInput(true);
    }
  };

  const confirmEnablePassword = async () => {
    if (!newPassword) return;
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
      user.username = usernameInput; // Optimistic update or refresh needed
      setIsEditingUsername(false);
      router.refresh();
    } catch (error: any) {
      setUsernameError(error.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Profile</h2>
        <div className="bg-surface-raised rounded-xl py-4 px-6 border border-border-subtle flex flex-col md:flex-row items-center gap-4">
          <div className="rounded-full bg-bg-muted flex items-center justify-center overflow-hidden shrink-0">
            <ProfilePic src={user.avatarUrl} name={user.username} size={88} />
          </div>

          <div className="flex-1">
            {isEditingUsername ? (
              <div className="flex flex-col md:flex-row items-start gap-2">
                <div className="space-y-1">
                  <input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="bg-bg-muted border-2 border-border-subtle rounded-lg p-1 text-lg font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-all"
                    placeholder="Username"
                    disabled={loading}
                  />
                  {usernameError && (
                    <p className="text-xs text-error">{usernameError}</p>
                  )}
                </div>
                <div className="w-full flex gap-1 md:gap-2 justify-end">
                  <button
                    onClick={handleUpdateUsername}
                    disabled={loading}
                    className="p-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-strong disabled:opacity-50 transition-colors cursor-pointer hover:scale-105"
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
                    className="p-2 bg-bg-muted text-text-secondary rounded-lg hover:bg-border-subtle transition-colors cursor-pointer hover:scale-105"
                  >
                    <LogOut size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h3 className="text-lg font-semibold text-text-primary">{user.username}</h3>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="md:opacity-0 group-hover:opacity-100 transition-opacity p-1 text-accent-primary hover:text-accent-strong cursor-pointer hover:scale-105"
                >
                  <span className="text-xs">Edit</span>
                </button>
              </div>
            )}
            <p className="text-text-secondary text-sm">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Appearance</h2>
        <div className="bg-surface-raised rounded-xl overflow-hidden border border-border-subtle">
          {/* Theme Selection */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Theme</p>
              <p className="text-xs text-text-muted">Choose your preferred theme</p>
            </div>
            <select
              value={mode}
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
              className="bg-bg-muted border-2 border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-all"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Security</h2>
        <div className="bg-surface-raised rounded-xl overflow-hidden border border-border-subtle">
          {/* Password Auth */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-text-primary">Password Authentication</p>
                <p className="text-xs text-text-muted">Enable logging in with an email and password</p>
              </div>

              {!showPasswordInput && (
                <button
                  onClick={handleTogglePasswordParams}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${passwordEnabled
                    ? "bg-error/10 text-error hover:bg-error/20"
                    : "bg-accent-primary text-text-inverse hover:bg-accent-strong hover:scale-105"
                    } disabled:opacity-50 cursor-pointer`}
                >
                  {passwordEnabled ? "Disable" : "Enable"}
                </button>
              )}
            </div>

            {showPasswordInput && (
              <div className="mt-4 flex gap-2">
                <input
                  type="password"
                  placeholder="Set a password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 bg-bg-muted border-2 border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-all"
                />
                <button
                  onClick={confirmEnablePassword}
                  disabled={!newPassword || loading}
                  className="px-4 py-2 bg-accent-primary text-text-inverse text-sm rounded-lg hover:bg-accent-strong disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowPasswordInput(false)}
                  className="px-4 py-2 bg-bg-muted text-text-secondary text-sm rounded-lg hover:bg-border-subtle transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Account Actions */}
      <section className="space-y-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-error/10 hover:bg-error/20 text-error p-4 rounded-xl transition-colors font-semibold border border-error/30 cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </section>
    </div>
  );
}