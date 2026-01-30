import { create } from "zustand";
import { Call, CallState } from "./call.types";

interface CallStore {
  call: Call | null;
  callState: CallState;

  // selectors (derived, not stored)
  isInCall: () => boolean;
  isRinging: () => boolean;
  isConnected: () => boolean;

  // state setters (pure)
  setIncomingCall: (call: Call) => void;
  setOutgoingCall: (call: Call) => void;
  updateCallState: (state: CallState) => void;
  updateParticipantState: (
    userId: string,
    state: Call["participants"][string]["state"],
  ) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallStore>((set, get) => ({
  call: null,
  callState: "IDLE",

  isInCall: () => {
    const s = get().callState;
    return s !== "IDLE" && s !== "ENDED";
  },

  isRinging: () => get().callState === "RINGING",

  isConnected: () => get().callState === "CONNECTED",

  setIncomingCall: (call) =>
    set({
      call,
      callState: "RINGING",
    }),

  setOutgoingCall: (call) =>
    set({
      call,
      callState: "CALLING",
    }),

  updateCallState: (state) =>
    set((prev) => ({
      callState: state,
      call: prev.call
        ? {
            ...prev.call,
            state,
          }
        : null,
    })),

  updateParticipantState: (userId, state) =>
    set((prev) => {
      if (!prev.call) return prev;

      return {
        call: {
          ...prev.call,
          participants: {
            ...prev.call.participants,
            [userId]: {
              ...prev.call.participants[userId],
              state,
            },
          },
        },
      };
    }),

  resetCall: () =>
    set({
      call: null,
      callState: "IDLE",
    }),
}));
