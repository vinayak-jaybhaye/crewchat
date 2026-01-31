import type { ReactNode } from "react";
import IconRail from "@/components/navigation/IconRail";
import SocketProvider from "@/components/providers/SocketProvider";
import CallUI from "@/components/call/CallUI";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <div className="w-screen h-dvh">
        <CallUI />
        <div className="flex h-full">
          <div className="hidden md:block">
            <IconRail />
          </div>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </SocketProvider>
  );
}
