"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { LogOut, Shield, User } from "lucide-react";
import { enablePasswordAuthentication, disablePasswordAuthentication, updateUsername, checkUsernameAvailability } from "@/lib/actions/account.actions";
import { useRouter } from "next/navigation";
import { UserDetailsDTO } from "@/lib/types/user.types";

interface SettingsClientProps {
    user: UserDetailsDTO;
}

export default function SettingsClient({ user }: SettingsClientProps) {
    const [loading, setLoading] = useState(false);
    const [passwordEnabled, setPasswordEnabled] = useState(user.passwordAuthenticationEnabled ?? false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const router = useRouter();

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
            await checkUsernameAvailability(usernameInput);
            await updateUsername(usernameInput);
            user.username = usernameInput; // Optimistic update or refresh needed
            setIsEditingUsername(false);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            setUsernameError(error.message || "Failed to update username");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Profile Section */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Profile</h2>
                <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.username}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <User size={32} className="text-neutral-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        {isEditingUsername ? (
                            <div className="flex items-start gap-2">
                                <div className="space-y-1">
                                    <input
                                        value={usernameInput}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setUsernameInput(e.target.value)}
                                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1 text-lg font-semibold text-neutral-100 outline-none focus:border-blue-500"
                                        placeholder="Username"
                                        disabled={loading}
                                    />
                                    {usernameError && (
                                        <p className="text-xs text-red-500">{usernameError}</p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={handleUpdateUsername}
                                        disabled={loading}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        <Shield size={16} /> {/* Reusing Shield as check/save icon temporarily or import Check */}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingUsername(false);
                                            setUsernameInput(user.username);
                                            setUsernameError("");
                                        }}
                                        disabled={loading}
                                        className="p-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700"
                                    >
                                        <LogOut size={16} className="rotate-180" /> {/* Reusing LogOut as Cancel temporarily or import X */}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 group">
                                <h3 className="text-lg font-semibold text-neutral-100">{user.username}</h3>
                                <button
                                    onClick={() => setIsEditingUsername(true)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-500 hover:text-neutral-300"
                                >
                                    <span className="text-xs">Edit</span>
                                </button>
                            </div>
                        )}
                        <p className="text-neutral-400 text-sm">{user.email}</p>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Security</h2>
                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 divide-y divide-neutral-800">
                    {/* Password Auth */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-neutral-200">Password Authentication</p>
                                    <p className="text-xs text-neutral-500">Enable logging in with an email and password</p>
                                </div>
                            </div>

                            {!showPasswordInput && (
                                <button
                                    onClick={handleTogglePasswordParams}
                                    disabled={loading}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${passwordEnabled
                                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                        : "bg-blue-600 text-white hover:bg-blue-500"
                                        }`}
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
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={confirmEnablePassword}
                                    disabled={!newPassword || loading}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-50"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setShowPasswordInput(false)}
                                    className="px-4 py-2 bg-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-700"
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
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-4 rounded-xl transition-colors font-medium border border-red-500/20"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </section>
        </div>
    );
}
