import Link from "next/link";
import { ProfilePic } from "@/components/user";
import { IconRailNavigation } from "./IconRailNavigation";
import { auth } from "@/auth";

export default async function IconRail() {
  const session = await auth();

  return (
    <nav className="h-full w-12 md:w-16 flex flex-col justify-between bg-surface-selected">
      <div className="flex flex-col items-center gap-4 py-4">
        <IconRailNavigation />
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-4 py-4">
        {/* Profile image */}
        <Link
          href="/settings"
          aria-label="Settings"
          className="h-10 w-10 rounded-full overflow-hidden border border-border-subtle"
        >
          <ProfilePic
            src={session?.user?.avatarUrl || session?.user?.image}
            name={session?.user?.username}
            size={40}
          />
        </Link>
      </div>
    </nav>
  );
}
