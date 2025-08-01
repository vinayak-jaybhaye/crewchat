import React from 'react';

export function MessageWithMentions({
    cleanMessage,
    idUsernameMap
}: {
    cleanMessage: string;
    idUsernameMap: Record<string, string>;
}) {
    const renderMessageWithMentions = () => {
        // Match all patterns like @mention:{userId}
        return cleanMessage.replace(/@mention:\{(.*?)\}/g, (_, userId) => {
            const username = idUsernameMap[userId];
            return `<a href="/user/${username || userId}" class="text-blue-500 hover:underline">@${username || userId}</a>`;
        });
    };

    return (
        <p
            className="text-sm whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: renderMessageWithMentions() }}
        />
    );
}
