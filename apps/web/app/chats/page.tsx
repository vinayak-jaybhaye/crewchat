import ChatCard from "@/components/ChatCard";
import { fetchUserChats } from "@/app/actions/ChatActions";

export default async function Chats() {
    const chats = await fetchUserChats();

    return (
        <div>
            {chats.map((chat) => (
                <ChatCard key={chat._id} chat={chat} />
            ))}
        </div>
    );
}
