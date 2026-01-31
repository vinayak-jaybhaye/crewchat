import { create } from "zustand";

interface WebRTCSignal {
  type: "offer" | "answer" | "ice";
  callId: string;
  data: any;
}

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
