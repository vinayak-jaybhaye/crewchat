import Link from "next/link";
import { ProfilePic } from "@/components/user";
import { IconRailNavigation } from "./IconRailNavigation";
import { auth } from "@/auth";

export default async function IconRail() {
  const session = await auth();

  return (
    <nav className="h-full w-16 flex flex-col justify-between bg-bg-subtle border-r border-border-subtle shrink-0">
      <div className="flex flex-col items-center gap-4 py-4 w-full">
        <IconRailNavigation />
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-4 py-6 w-full">
        {/* Settings button with tooltip & hover state */}
        <div className="relative group flex items-center justify-center w-full">
          <div className="absolute left-0 w-1 rounded-r-full bg-accent-primary transition-all duration-300 h-0 opacity-0 group-hover:h-3 group-hover:opacity-60" />
          
          <Link
            href="/settings"
            aria-label="Settings"
            className="h-10 w-10 rounded-xl overflow-hidden border border-border-subtle hover:border-accent-primary hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <ProfilePic
              src={session?.user?.avatarUrl || session?.user?.image}
              name={session?.user?.username}
              size={40}
            />
          </Link>
          
          {/* Custom CSS Tooltip */}
          <div className="absolute left-18 px-2.5 py-1.5 rounded-lg bg-text-primary text-text-inverse text-xs font-semibold shadow-md opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
            Settings
          </div>
        </div>
      </div>
    </nav>
  );
}
