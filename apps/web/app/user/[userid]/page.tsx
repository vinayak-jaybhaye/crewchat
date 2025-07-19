import { StartChatButton } from "@/components/StartChatButton";
import { getUserById } from "@/app/actions/UserActions";


export default async function UserProfile({ params }: { params: { userid: string } }) {
    const { userid } = await params;
    const user = await getUserById(userid);

    console.log("User Profile:", user);

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div>
            <h1>{user.username}</h1>
            <p>User ID: {user._id.toString()}</p>
            <p>Email: {user.email}</p>

            <StartChatButton userId={userid} />
        </div>
    );
}
