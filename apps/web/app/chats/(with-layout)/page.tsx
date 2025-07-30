export default async function Chats() {
    return (
        <div className="flex items-center justify-center h-full w-full bg-[var(--background)]">
            <div className="text-center px-4">
                <p className="text-[var(--secondary)] text-lg max-w-md mx-auto">
                    Select a{' '}
                    <span className="font-semibold text-[var(--foreground)]">
                        Chat
                    </span>{' '}
                    or{' '}
                    <span className="font-semibold text-[var(--foreground)]">
                        Group
                    </span>{' '}
                    to start chatting
                </p>
            </div>
        </div>
    );
}
