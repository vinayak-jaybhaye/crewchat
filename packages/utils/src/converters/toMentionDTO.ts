import { MentionDTO } from '@crewchat/types'

export function toMentionDTO(mention: any): MentionDTO {
    return {
        _id: mention._id.toString(),
        messageId: mention.messageId.toString(),
        mentionedUserId: mention.mentionedUserId.toString(),
        mentionedByUserId: mention.mentionedByUserId.toString(),
        chatId: mention.chatId.toString(),
        createdAt: mention.createdAt.toISOString(),
        updatedAt: mention.updatedAt?.toISOString()
    };
}
