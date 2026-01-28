import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { UserDTO } from "@/lib/types/user.types";

export interface UserStore {
    usersById: Record<string, UserDTO>;

    upsertUser: (user: UserDTO) => void;
    upsertUsers: (users: UserDTO[]) => void;
    getUserById: (id: string) => UserDTO | undefined;
    getUsersSnapshot: () => UserDTO[];
}

export const useUserStore = create<UserStore>()(
    immer((set, get) => ({
        usersById: {},

        upsertUser: (user: UserDTO) =>
            set((state: UserStore) => {
                state.usersById[user.id] = user;
            }),

        upsertUsers: (users: UserDTO[]) =>
            set((state: UserStore) => {
                for (const user of users) {
                    state.usersById[user.id] = user;
                }
            }),

        getUsersSnapshot: () => Object.values(get().usersById),

        getUserById: (id) => get().usersById[id],
    }))
);
