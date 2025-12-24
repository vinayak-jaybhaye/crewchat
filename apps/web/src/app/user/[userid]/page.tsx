import { StartChatButton, BackButton } from "@/components/atoms";
import { getUserById } from "@/app/actions/UserActions";
import { CallButton } from "@/components/call";
import Image from "next/image";
import { Mail, Calendar, Hash, User as UserIcon } from 'lucide-react';

export default async function UserProfile({ params }: { params: Promise<{ userid: string }> }) {
    const { userid } = await params;
    const user = await getUserById(userid);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-[var(--muted-foreground)] gap-4">
                <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">User not found</p>
                <BackButton title="Go Back" />
            </div>
        );
    }

    // Deterministic gradient based on username length
    const gradients = [
        "from-blue-500 to-cyan-500",
        "from-purple-500 to-pink-500",
        "from-orange-500 to-red-500",
        "from-green-500 to-teal-500",
    ];
    const gradient = gradients[user.username.length % gradients.length];

    return (
        <div className="min-h-full w-full bg-[var(--background)]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-6">
                    <BackButton title="Profile" />
                </div>

                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    {/* Header / Cover */}
                    <div className={`h-32 sm:h-48 bg-gradient-to-r ${gradient} relative`}>
                        <div className="absolute inset-0 bg-black/10" />
                    </div>

                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 relative">
                        {/* Avatar Layer */}
                        <div className="-mt-16 sm:-mt-20 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                            <div className="relative p-1 bg-[var(--card)] rounded-full">
                                {user?.avatarUrl ? (
                                    <Image
                                        src={user.avatarUrl}
                                        width={128}
                                        height={128}
                                        alt={user.username}
                                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[var(--card)] shadow-md bg-[var(--muted)]"
                                    />
                                ) : (
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center border-4 border-[var(--card)] shadow-md text-5xl font-bold uppercase">
                                        {user?.username?.[0] || "?"}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-center sm:text-left min-w-0 pb-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] truncate">
                                    {user.username}
                                </h1>
                                <p className="text-[var(--muted-foreground)] flex items-center justify-center sm:justify-start gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    Active Now
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pb-2">
                                <StartChatButton userId={userid} />
                                <CallButton userId={user._id} />
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                            <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] flex items-center gap-4">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm sm:text-base font-medium text-[var(--foreground)] truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] flex items-center gap-4">
                                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Hash className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">User ID</p>
                                    <p className="text-sm sm:text-base font-medium text-[var(--foreground)] truncate font-mono">{user._id}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] flex items-center gap-4 sm:col-span-2">
                                <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Joined</p>
                                    <p className="text-sm sm:text-base font-medium text-[var(--foreground)] truncate">
                                        Member since 2024
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
