"use client";

import { useCallStore } from "@/store/call.store";
import IncomingCallModal from "./IncomingCallModal";
import OutgoingCallModal from "./OutgoingCallModal";
import CallScreen from "./CallScreen";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/user.store";
import { useEffect } from "react";
import { UserDTO } from "@/lib/types/user.types";
import { getUserByIdAction } from "@/lib/actions/user.actions";

export default function CallUI() {
  const { data: session } = useSession();
  const { call, state } = useCallStore();
  const otherUserId = call
    ? call.callerId === session?.user?.mongoId
      ? call.calleeId
      : call.callerId
    : null;

  // Preload other user data
  useEffect(() => {
    if (otherUserId) {
      const userInStore = useUserStore.getState().getUserById(otherUserId);
      if (!userInStore) {
        getUserByIdAction(otherUserId)
          .then((user: UserDTO) => {
            useUserStore.getState().upsertUser(user);
          })
          .catch((err) => {
            console.error("Failed to preload user data for call UI:", err);
          });
      }
    }
  }, [otherUserId]);

  useEffect(() => {
    if (!call || state !== "RINGING") return;

    const elapsed = Date.now() - call.createdAt;
    const remaining = Math.max(30000 - elapsed, 0);

    const timeout = setTimeout(() => {
      useCallStore.getState().endCall(call.callId, "system");
    }, remaining);

    return () => clearTimeout(timeout);
  }, [call?.callId, state]);


  if (!call || state === "IDLE") return null;

  if (state === "RINGING") {
    return call.callerId === session?.user?.mongoId ? (
      <OutgoingCallModal call={call} />
    ) : (
      <IncomingCallModal call={call} />
    );
  }

  if (state === "CONNECTED") {
    return <CallScreen call={call} />;
  }

  return null;
}
