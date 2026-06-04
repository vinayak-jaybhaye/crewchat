import { create } from "zustand";

type WebRTCSignal =
  | { type: "offer"; callId: string; data: RTCSessionDescriptionInit }
  | { type: "answer"; callId: string; data: RTCSessionDescriptionInit }
  | { type: "ice"; callId: string; data: RTCIceCandidateInit };

interface WebRTCStore {
  signal: WebRTCSignal | null;
  pushSignal: (signal: WebRTCSignal) => void;
  clearSignal: () => void;
}

export const useWebRTCStore = create<WebRTCStore>((set) => ({
  signal: null,
  pushSignal: (signal) => set({ signal }),
  clearSignal: () => set({ signal: null }),
}));
