import { fetchChatData } from '@/app/actions/ChatActions';
import { AddMembers, GroupMembers } from "@/components/chat";
import { fetchUserChatMetaData } from '@/app/actions/ChatActions';

export default async function GroupInfoPage({ params }: { params: { chatId: string } }) {
    const { chatId } = params;
    const chatData = await fetchChatData(chatId);
    const userChatMetadata = await fetchUserChatMetaData(chatId);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white shadow-sm py-4 px-6 flex items-center border-b">
                <h1 className="text-xl font-semibold">{chatData?.name}</h1>
            </header>

            <div className="flex overflow-y-auto p-4 bg-red-500">
                <p className="text-gray-600">Chat ID: {chatId}</p>
                <p className="text-gray-600">Description: {chatData?.description || "No description available."}</p>
            </div>

            <h2 className="text-lg font-semibold px-6 py-4 border-b">Group Information</h2>

            <h2 className="text-lg font-semibold px-6 py-4 border-b">Members</h2>
            <GroupMembers chatId={chatId} />
            {
                userChatMetadata?.isAdmin && (
                    <AddMembers chatId={chatId} />
                )
            }
        </div>
    );
}
