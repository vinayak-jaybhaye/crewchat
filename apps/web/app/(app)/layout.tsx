import type { ReactNode } from "react";
import IconRail from "@/components/navigation/IconRail";
import SocketProvider from "@/components/providers/SocketProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <div className="flex w-screen h-dvh">
        <div className="hidden md:block">
          <IconRail />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </SocketProvider>
  );
}
