'use server';

import { connectToDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
    createGroupChat as CGC,
    addMembersToGroupChat as addMembers,
    deleteGroupChat as deleteGroup,
    getGroupMembers as getMembers,
    removeMemberFromGroupChat,
    updateGroupChatMember,
    getIdUsernameMap
} from "@/lib/chat";

export async function createGroupChat(groupName: string, description?: string) {
    try {
        if( !groupName || groupName.trim() === "") {
            throw new Error("Group name is required");
        }
        await connectToDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("Unauthorized access to create group chat");
        }

        const groupChatParams = {
            name: groupName,
            description: description,
            owner: currentUser._id,
        };

        const chat = await CGC(groupChatParams);
        return chat;
    } catch (error) {
        console.error("Error creating group chat:", error);
        throw new Error("Failed to create group chat");
    }
}

export async function addMembersToGroupChat(chatId: string, memberIds: string[]) {
    console.log("Adding members to group chat:", chatId, memberIds);
    try {
        await connectToDB();
        console.log("Connected to database for adding members to group chat");
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("Unauthorized access to add members to group chat");
            throw new Error("Unauthorized access to add members to group chat");
        }

        await addMembers({ chatId, memberIds , currentUserId: currentUser._id.toString() });
        return;
    } catch (error) {
        console.error("Error adding members to group chat:", error);
        throw new Error("Failed to add members to group chat");
    }
}

export async function deleteGroupChat(chatId: string) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("Unauthorized access to delete group chat");
        }
        
        await deleteGroup(chatId,currentUser._id.toString());
    } catch (error) {
        console.error("Error deleting group chat:", error);
        throw new Error("Failed to delete group chat");
    }
}


import { type GroupMember } from "@/lib/chat/getGroupMembers";

export async function getGroupMembers(chatId: string, username?: string): Promise<GroupMember[]> {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("Unauthorized access to get group members");
        }

        return await getMembers(chatId, currentUser._id.toString(), username);
    } catch (error) {
        console.error("Error fetching group members:", error);
        throw new Error("Failed to fetch group members");
    }
}

export async function removeMember(chatId: string, memberId: string) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("Unauthorized access to remove member from group chat");
        }

        return await removeMemberFromGroupChat({ chatId, userId: memberId });

    } catch (error) {
        console.error("Error removing member from group chat:", error);
        throw new Error("Failed to remove member from group chat");
    }
}

export async function updateMemberPermissions(chatId: string, memberId: string, isAdmin: boolean) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("Unauthorized access to update member permissions");
        }

        return await updateGroupChatMember({ chatId, userId: memberId, isAdmin });


    } catch (error) {
        console.error("Error updating member permissions:", error);
        throw new Error("Failed to update member permissions");
    }
}

// export async function leaveGroupChat(chatId: string) {}
export async function fetchIdUsernameMap(chatId: string): Promise<Record<string, string>> {
    try {
        await connectToDB();
        console.log("Connected to database for fetching ID-Username map");
        return  await getIdUsernameMap(chatId);
    } catch (error) {
        console.error("Error fetching ID-Username map:", error);
        throw new Error("Failed to fetch ID-Username map");
    }
}