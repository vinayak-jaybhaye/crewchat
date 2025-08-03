import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { storeMessage } from "@/app/actions/MessageActions";
import { useSocket } from '@/hooks/useSocket';

interface GroupMember {
    userId: string;
    username: string;
}
interface MessageBoxProps {
    chatId: string;
    userId: string;
    idUsernameMap: Record<string, string>;
    scrollToBottom?: () => void;
}

const GroupMembersModal = ({
    members,
    onSelect,
    isVisible,
    onClose,
    position,
    selectedIndex,
    setSelectedIndex
}: {
    members: GroupMember[];
    onSelect: (member: GroupMember) => void;
    isVisible: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isVisible) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isVisible, onClose]);

    if (!isVisible || members.length === 0) return null;

    return (
        <div
            ref={modalRef}
            className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-48"
            style={{
                left: position.x,
                bottom: position.y + 10,
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
        >
            <div className="p-2">
                <ul className="space-y-1">
                    {members.map((member, index) => (
                        <li
                            key={member.userId}
                            onClick={() => onSelect(member)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors ${index === selectedIndex ? 'bg-gray-100' : ''
                                }`}
                        >
                            <span className="text-sm text-gray-800 truncate">
                                {member.username}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}


function MessageBox({ chatId, userId, idUsernameMap, scrollToBottom }: MessageBoxProps) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { sendMessage } = useSocket(chatId);
    const [mentionedUsers, setMentionedUsers] = useState<Record<string, string>[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<GroupMember[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [selectedMemberIndex, setSelectedMemberIndex] = useState(-1);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const members = useMemo(() => {
        return Object.entries(idUsernameMap).map(([userId, username]) => ({
            userId,
            username,
        }));
    }, [idUsernameMap]);

    // Fetch group members
    useEffect(() => {
        if (!showSuggestions) {
            setSuggestedUsers([]);
            return;
        }

        const filtered = members.filter(member =>
            member.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );

        setSuggestedUsers(filtered);
        setSelectedMemberIndex(0);
    }, [debouncedSearchTerm, showSuggestions, members]);


    // Update modal position
    const updateModalPosition = useCallback(() => {
        if (!inputRef.current) return;

        const inputRect = inputRef.current.getBoundingClientRect();
        const charWidth = 8;
        const x = Math.min(cursorPosition * charWidth, inputRect.width - 200);

        setModalPosition({
            x: x + 16,
            y: inputRect.height
        });
    }, [cursorPosition]);

    useEffect(() => {
        if (showSuggestions) updateModalPosition();
    }, [showSuggestions, updateModalPosition]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        try {
            setIsLoading(true);
            scrollToBottom?.();

            // all mentioned users should be unique
            const mentionUserIds: Set<string> = new Set();
            let updatedMessage = message;
            mentionedUsers.forEach(mention => {
                if (new RegExp(`@${mention.username}\\b`).test(message)) {
                    mentionUserIds.add(mention.userId);
                    // replace the mention in the message with the userId
                    updatedMessage = updatedMessage.replace(
                        new RegExp(`@${mention.username}\\b`, 'g'),
                        `@mention:{${mention.userId}}`
                    );
                }
            });

            const savedMessage = await storeMessage(chatId, userId, updatedMessage, Array.from(mentionUserIds));
            sendMessage(savedMessage);
            setMessage("");
            setMentionedUsers([]);
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }
            setShowSuggestions(false);
        } catch (error) {
            console.error("Failed to save message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (value: string) => {
        setMessage(value);
        const cursorPos = inputRef.current?.selectionStart || 0;
        setCursorPosition(cursorPos);

        const beforeCursor = value.slice(0, cursorPos);
        const lastAtIndex = beforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const afterAt = beforeCursor.slice(lastAtIndex + 1);
            if (!afterAt.includes(' ')) {
                setSearchTerm(afterAt);
                setShowSuggestions(true);
                return;
            }
        }
        setShowSuggestions(false);
    };

    const handleMemberSelect = (member: GroupMember) => {
        const cursorPos = inputRef.current?.selectionStart || 0;
        const beforeCursor = message.slice(0, cursorPos);
        const afterCursor = message.slice(cursorPos);

        const lastAtIndex = beforeCursor.lastIndexOf('@');
        if (lastAtIndex === -1) return;

        const beforeAt = message.slice(0, lastAtIndex);
        const newMessage = `${beforeAt}@${member.username} ${afterCursor}`;

        setMessage(newMessage);
        setMentionedUsers(prev => [...prev, { username: member.username, userId: member.userId }]);
        setShowSuggestions(false);

        setTimeout(() => {
            if (inputRef.current) {
                const newCursorPos = lastAtIndex + member.username.length + 2;
                inputRef.current.selectionStart = newCursorPos;
                inputRef.current.selectionEnd = newCursorPos;
                inputRef.current.focus();
            }
        });
    };

    const closeSuggestions = () => {
        setShowSuggestions(false);
        setSuggestedUsers([]);
        setSearchTerm('');
        setSelectedMemberIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions && suggestedUsers.length > 0) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedMemberIndex(prev =>
                        (prev + 1) % suggestedUsers.length
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedMemberIndex(prev =>
                        prev <= 0 ? suggestedUsers.length - 1 : prev - 1
                    );
                    break;
                case 'Enter':
                case 'Tab':
                    if (selectedMemberIndex >= 0 && selectedMemberIndex < suggestedUsers.length) {
                        e.preventDefault();
                        handleMemberSelect(suggestedUsers[selectedMemberIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeSuggestions();
                    break;
            }
        } else {
            if (e.key === 'Enter' && e.shiftKey) {
                return;
            }

            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }
    };


    return (
        <div className="relative">
            <GroupMembersModal
                members={suggestedUsers}
                onSelect={handleMemberSelect}
                isVisible={showSuggestions}
                onClose={closeSuggestions}
                position={modalPosition}
                selectedIndex={selectedMemberIndex}
                setSelectedIndex={setSelectedMemberIndex}
            />

            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-[var(--card)] border-t border-[var(--border)] p-4"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center">
                        <div className="flex-1 flex flex-row relative justify-around items-start">
                            <textarea
                                ref={inputRef}
                                value={message}
                                onChange={(e) => {
                                    handleInputChange(e.target.value)

                                    const el = e.target;
                                    el.style.height = 'auto';
                                    el.style.height = `${el.scrollHeight}px`;
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="start typing here..."
                                className="w-full max-h-40 py-3 px-4 bg-[var(--background)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none overflow-scroll scrollbar-hide"
                                rows={1}
                                disabled={isLoading}
                                autoComplete="off"
                            />

                            <div className='h-full p-2'>
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!message.trim() || isLoading}
                                    className="bg-[var(--primary)] text-white rounded-full p-2 hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                                    title="Send message"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                        <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default MessageBox;