import { auth } from "@/auth";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";
import { getUserProfileDetailsAction } from "@/lib/actions/account.actions";
import Link from "next/link";
import { X } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  const user = await getUserProfileDetailsAction();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold mb-8">Settings</h1>
          <Link
            href="/chats"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>

        <SettingsClient
          user={user}
        />
      </div>
    </div>
  );
}
