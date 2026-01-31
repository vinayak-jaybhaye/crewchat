import { create } from "zustand";

export type CallState = "IDLE" | "RINGING" | "CONNECTED";
export type CallType = "VOICE" | "VIDEO";

export interface Call {
  callId: string;
  type: CallType;
  state: CallState;

  callerId: string;
  calleeId: string;

  createdAt: number;
  connectedAt?: number;
}

interface CallStore {
  call: Call | null;
  state: CallState;

  incomingCall: (call: Call) => void;
  startCall: (call: Call) => void;
  connectCall: (call: Call) => void;
  resumeCall: (call: Call) => void;
  endCall: (callId: string, endedBy: string) => void;
}


export const useCallStore = create<CallStore>((set) => ({
  call: null,
  state: "IDLE",

  incomingCall: (call) =>
    set({
      call,
      state: "RINGING",
    }),

  startCall: (call) =>
    set({
      call,
      state: "RINGING",
    }),

  connectCall: (call) =>
    set({
      call,
      state: "CONNECTED",
    }),

  resumeCall: (call) =>
    set({
      call,
      state: call.state,
    }),

  endCall: (callId, endedBy) =>
    set({
      call: null,
      state: "IDLE",
    }),
}));
