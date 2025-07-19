import ChatCard from "@/components/chat/ChatCard";
import { fetchUserChats } from "@/app/actions/ChatActions";
import { CreateGroup } from "@/components/chat";

export default async function Chats() {
    const chats = await fetchUserChats();

    return (
        <div>
            {chats.map((chat) => (
                <ChatCard key={chat._id} chat={chat} />
            ))}
            <CreateGroup />
        </div>
    );
}
