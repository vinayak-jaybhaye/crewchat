import { auth } from "@/auth";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";
import { getUserProfileDetailsAction } from "@/lib/actions/account.actions";
import Link from "next/link";
import { X } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = await getUserProfileDetailsAction();

  return (
    <div className="min-h-screen bg-bg-app text-text-primary">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Link
            href="/chats"
            className="inline-flex items-center justify-center rounded-lg bg-bg-muted border border-border-subtle p-2 text-text-secondary hover:text-accent-primary hover:border-accent-secondary transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>

        <SettingsClient user={user} />
      </div>
    </div>
  );
}

