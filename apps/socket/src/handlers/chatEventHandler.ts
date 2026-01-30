import { Server } from "socket.io";

interface ChatMessageEvent {
    type: "message:new";
    chatId: string
    message: {
        messageId: string;
        chatId: string;
        senderId: string;
        content: string;
        createdAt: string;
        editedAt: string | null;
        deletedAt: string | null;
    };
}

interface ChatMessageEditEvent {
    type: "message:edit";
    chatId: string;
    messageId: string;
    content: string;
}

interface ChatMessageDeleteEvent {
    type: "message:delete";
    chatId: string;
    messageId: string;
}


export async function handleChatEvent(
    io: Server,
    event: ChatMessageEvent | ChatMessageEditEvent | ChatMessageDeleteEvent
) {
    console.log("Chat event", event.type);
    // switch on event type
    switch (event.type) {
        case "message:new": {
            const { message, chatId } = event;
            io.to(`chat:${chatId}`).emit("message:new", message);
            break;
        }
        case "message:edit": {
            const { messageId, chatId, content } = event;
            io.to(`chat:${chatId}`).emit("message:edit", { chatId, messageId, content });
            break;
        }
        case "message:delete": {
            const { messageId, chatId } = event;
            io.to(`chat:${chatId}`).emit("message:delete", { chatId, messageId });
            break;
        }
    }
}