'use client';

import useTheme from '@/hooks/useTheme';
import { useState } from 'react';
import { BackButton, ChangeUsernameForm } from '@/components/atoms';
import { signOut } from 'next-auth/react';

const themes = [
    { id: "theme-light", name: "light", class: "bg-white text-gray-900" },
    { id: "theme-dark", name: "dark", class: "bg-gray-900 text-white" },
    { id: "theme-sepia", name: "sepia", class: "bg-[#f4ecd8] text-[#5b4636]" },
];

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [language, setLanguage] = useState('en');


    const handleThemeChange = (themeId: string) => {
        setTheme(themeId);
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
            <BackButton title='Settings' />

            {/* Appearance */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Appearance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleThemeChange(t.id)}
                            className={`p-4 rounded-lg border transition-all duration-150 
                                        shadow-sm hover:shadow-md focus:outline-none
                                        ${theme === t.id
                                    ? "ring-2 ring-[var(--primary)] border-[var(--primary)]"
                                    : "border-gray-200"} ${t.class}`}
                        >
                            <div className="font-medium">{t.name}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Username */}
            <ChangeUsernameForm />

            {/* Notifications */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Notifications</h2>
                <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600">Enable Notifications</label>
                    <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="h-5 w-5"
                    />
                </div>
            </section>

            {/* Language */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Language</h2>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full sm:w-64 border px-4 py-2 rounded focus:ring-2 focus:ring-[var(--primary)]"
                >
                    <option value="en">English</option>
                </select>
            </section>

            {/* Danger Zone */}
            <section>
                <h2 className="text-xl font-semibold text-red-600 mb-4">Account</h2>
                <div className="space-y-4">
                    <button
                        className="w-full text-left text-sm text-gray-600 hover:underline cursor-pointer"
                        onClick={() => signOut()}
                    >
                        Log Out
                    </button>
                </div>
            </section>
        </div>
    );
}
