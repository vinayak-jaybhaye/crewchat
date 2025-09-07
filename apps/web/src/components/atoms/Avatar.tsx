import Image from "next/image"

type AvatarProps = {
    username: string;
    avatarUrl?: string;
    size?: number;
}

export default function Avatar({ username, avatarUrl, size = 40 }: AvatarProps) {
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };
    return (
        <div className="flex-shrink-0">
            {avatarUrl ? (
                <Image
                    src={avatarUrl}
                    alt={username}
                    className="rounded-full object-cover border-2 border-[var(--border)] shadow-sm"
                    width={size}
                    height={size}
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {getInitials(username)}
                </div>
            )}
        </div>
    );
}