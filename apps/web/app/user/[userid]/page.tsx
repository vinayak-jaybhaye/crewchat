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
        <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
            <img
                src={user?.avatarUrl}
                alt="Avatar"
                style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginRight: "1.5rem", border: "2px solid #e5e7eb" }}
            />
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{user.username}</h1>
            </div>
            <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0" }}>
            <strong>User ID:</strong> {user._id.toString()}
            </p>
            <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0" }}>
            <strong>Email:</strong> {user.email}
            </p>
            <div style={{ textAlign: "right" }}>
            <StartChatButton userId={userid} />
            </div>
        </div>
    );
}
