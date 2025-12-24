'use client';

import useTheme from '@/hooks/useTheme';
import { useState } from 'react';
import { BackButton, ChangeUsernameForm } from '@/components/atoms';
import { signOut } from 'next-auth/react';
import { Palette, Bell, Globe, LogOut, User, Moon, Sun, Coffee } from 'lucide-react';

const themes = [
    { id: "theme-light", name: "Light", class: "bg-white text-gray-900", icon: Sun },
    { id: "theme-dark", name: "Dark", class: "bg-gray-900 text-white", icon: Moon },
    { id: "theme-sepia", name: "Sepia", class: "bg-[#f4ecd8] text-[#5b4636]", icon: Coffee },
];

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [language, setLanguage] = useState('en');


    const handleThemeChange = (themeId: string) => {
        setTheme(themeId);
    };

    return (
        <div className="min-h-full w-full bg-[var(--background)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <BackButton title='Settings' />
                </div>

                <div className="grid gap-8">
                    {/* Appearance */}
                    <section className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Palette className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--foreground)]">Appearance</h2>
                                <p className="text-sm text-[var(--muted-foreground)]">Customize how CrewChat looks on your device</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {themes.map((t) => {
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => handleThemeChange(t.id)}
                                            className={`group relative p-4 rounded-xl border-2 transition-all duration-200 
                                            text-left hover:scale-[1.02] focus:outline-none
                                            ${theme === t.id
                                                    ? "border-[var(--primary)] ring-1 ring-[var(--primary)] bg-[var(--background)] shadow-md"
                                                    : "border-transparent bg-[var(--muted)]/50 hover:bg-[var(--muted)]"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon className="w-5 h-5 opacity-70" />
                                                <span className="font-semibold">{t.name}</span>
                                            </div>
                                            <div className={`h-12 w-full rounded-lg ${t.class} opacity-80 border border-black/10`} />
                                            {theme === t.id && (
                                                <div className="absolute top-4 right-4 text-[var(--primary)]">
                                                    <div className="w-2 h-2 rounded-full bg-current" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Account Settings */}
                    <section className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--foreground)]">Account Settings</h2>
                                <p className="text-sm text-[var(--muted-foreground)]">Manage your personal information</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <ChangeUsernameForm />
                        </div>
                    </section>

                    {/* Preferences */}
                    <section className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--foreground)]">Preferences</h2>
                                <p className="text-sm text-[var(--muted-foreground)]">Manage notifications and language</p>
                            </div>
                        </div>
                        <div className="p-6 divide-y divide-[var(--border)]">
                            <div className="flex items-center justify-between py-4 first:pt-0">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
                                    <div>
                                        <p className="font-medium text-[var(--foreground)]">Push Notifications</p>
                                        <p className="text-sm text-[var(--muted-foreground)]">Receive messages and alerts</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationsEnabled}
                                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between py-4 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-[var(--muted-foreground)]" />
                                    <div>
                                        <p className="font-medium text-[var(--foreground)]">Language</p>
                                        <p className="text-sm text-[var(--muted-foreground)]">Select your preferred language</p>
                                    </div>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] block p-2.5 outline-none transition-shadow"
                                >
                                    <option value="en">English (US)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 overflow-hidden">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Log Out</h2>
                                    <p className="text-sm text-red-600/70 dark:text-red-400/70">Sign out of your account on this device</p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="px-4 py-2 bg-white dark:bg-red-950 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                            >
                                Log Out
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
