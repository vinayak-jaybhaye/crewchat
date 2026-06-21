// Chat types
export interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  deletedAt: string | null;
  createdAt: string;
}

export interface ChatPreviewDTO {
  id: string;
  isGroup: boolean;
  name: string;
  imageUrl: string | null;
  lastMessage: LastMessage | null;
  pinned: boolean;
  muted: boolean;
  unreadCount: number;
}

export interface ChatDetailsDTO {
  id: string;
  isGroup: boolean;
  name: string;
  imageUrl: string | null;
  description: string;
  role: "admin" | "member";
  createdAt: string;
  muted: boolean;
  otherMemberDetails?: {
    id: string;
    username: string;
    avatarUrl?: string;
    email: string;
    lastActive: string;
  };
}

export interface ChatMemberDTO {
  id: string;
  username: string;
  avatarUrl: string | null;
  email: string;
  lastActive?: string;
  role: "member" | "admin";
}

export interface MinimalChatPreviewDTO {
  id: string;
  isGroup: boolean;
  name: string;
  imageUrl: string | null;
  pinned: boolean;
  muted: boolean;
}

// Message types
export interface MessageDTO {
  messageId: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

// User types
export interface UserDetailsDTO {
  username: string;
  email: string;
  avatarUrl?: string | null;
  passwordAuthenticationEnabled: boolean;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDTO {
  username: string;
  email: string;
  avatarUrl?: string | null;
  id: string;
  lastActive?: string;
}

export interface UpdatePasswordAuthStatusParams {
  userId: string;
  enabled: boolean;
}

export interface UpdatePasswordAuthStatusResponse {
  success: boolean;
}

export interface UpdateUsernameParams {
  userId: string;
  username: string;
}

export interface UpdateUsernameResponse {
  success: boolean;
}

export interface CheckUsernameAvailabilityParams {
  username: string;
}

export interface CheckUsernameAvailabilityResponse {
  available: boolean;
}
