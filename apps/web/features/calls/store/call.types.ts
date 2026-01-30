export type CallType = "audio" | "video";

export type CallState =
  | "IDLE"
  | "CALLING"
  | "RINGING"
  | "CONNECTED"
  | "ENDED"
  | "REJECTED"
  | "MISSED"
  | "BUSY"
  | "FAILED";

export type ParticipantState =
  | "IDLE"
  | "CALLING"
  | "RINGING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "LEFT";

export interface CallParticipant {
  userId: string;
  role: "caller" | "callee";
  state: ParticipantState;
}

export interface Call {
  callId: string;
  type: CallType;
  state: CallState;

  callerId: string;
  calleeId: string;

  participants: Record<string, CallParticipant>;

  createdAt: number;
}
