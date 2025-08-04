import { StartChatButton, BackButton } from "@/components/atoms";
import { getUserById } from "@/app/actions/UserActions";
import { CallButton } from "@/components/call";
import Image from "next/image";

export default async function UserProfile({ params }: { params: Promise<{ userid: string }> }) {
    const { userid } = await params;
    const user = await getUserById(userid);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[80vh] text-gray-500 text-lg">
                User not found
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="px-4 mb-8">
                <BackButton title="Profile" />
            </div>

            <section>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                    {/* Avatar */}
                    {user?.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            width={96}
                            height={96}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-400 text-white flex items-center justify-center text-3xl font-semibold border shadow-sm">
                            {user?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                    )}

                    {/* User Info */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-[var(--text)]">{user.username}</h1>
                        <p className="text-[var(--text)] mt-1">{user.email}</p>

                        <div className="flex items-center justify-start gap-4 py-4 ">
                            <StartChatButton userId={userid} />
                            <CallButton userId={user._id} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <hr className="my-10 border-[var(--border)]" />

            {/* Extra info (optional future use) */}
            <div className="text-gray-600 space-y-2 text-sm">
                <p><strong>User ID:</strong> {user._id}</p>
                {/* Add more fields here if needed */}
            </div>
        </div>
    );
}
