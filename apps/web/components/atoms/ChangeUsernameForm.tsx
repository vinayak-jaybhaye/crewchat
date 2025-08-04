'use client'

import { useState, useEffect } from "react"
import { changeUsername, usernameExists } from "@/app/actions/UserActions"

let debounceTimer: NodeJS.Timeout;

export default function ChangeUsernameForm() {
    const [input, setInput] = useState<string>("")
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [checking, setChecking] = useState(false)
    const [message, setMessage] = useState<string>("")

    useEffect(() => {
        if (!input.trim()) {
            setIsAvailable(null)
            setMessage("")
            return
        }

        setChecking(true)
        clearTimeout(debounceTimer)

        debounceTimer = setTimeout(async () => {
            const exists = await usernameExists({ username: input.trim() })
            setIsAvailable(!exists)
            setMessage(exists ? "Username already taken" : "Username available")
            setChecking(false)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [input])

    const handleSave = async () => {
        try {
            await changeUsername({ username: input.trim() })
            setMessage("Username changed successfully!")
            setInput("");
        } catch (error) {
            setMessage("Something went wrong.")
        }
    }

    const inputBorderClass = isAvailable === false
        ? "border-red-500 focus:ring-red-500"
        : isAvailable === true
            ? "border-green-500 focus:ring-green-500"
            : ""

    return (
        <section>
            <label className="block mb-2 text-sm font-medium text-gray-600">Change Username</label>
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="New username"
                    className={`w-full border rounded px-4 py-2 focus:ring-2 focus:outline-none ${inputBorderClass}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    className="bg-[var(--primary)] text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
                    onClick={handleSave}
                    disabled={!input || isAvailable !== true}
                >
                    Save
                </button>
            </div>
            {message && (
                <p className={`mt-2 text-sm ${isAvailable === false ? "text-red-500" : "text-green-600"}`}>
                    {checking ? "Checking..." : message}
                </p>
            )}
        </section>
    )
}
