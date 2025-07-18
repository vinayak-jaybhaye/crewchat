import { connectToDB } from "@/lib/db";
import { IUser, User } from "@crewchat/db";
import { UserDTO } from "@crewchat/types";
import { toUserDTO } from "@crewchat/utils/converters";
import { StartChatButton } from "@/components/StartChatButton";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";


export default async function UserProfile({ params }: { params: { userid: string } }) {
    const { userid } = params;

    await connectToDB();
    const user = await User.findById(userid).lean();

    if (!user) {
        return <div>No user found.</div>;
    }

    const userDTO: UserDTO = toUserDTO(user)

    // Get current user id from session 
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser ? currentUser._id : null;

    if (!currentUserId) {
        return <div>Please log in to view user profiles.</div>;
    }

    return (
        <div>
            <h1>{userDTO.username}</h1>
            <p>User ID: {userDTO._id.toString()}</p>
            <p>Email: {userDTO.email}</p>

            <StartChatButton currentUserId={currentUserId} otherUserId={userid} />
        </div>
    );
}
