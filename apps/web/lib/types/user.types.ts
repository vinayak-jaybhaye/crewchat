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