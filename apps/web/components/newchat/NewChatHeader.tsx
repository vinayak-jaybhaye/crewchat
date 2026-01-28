import { ArrowLeft } from "lucide-react";

interface NewChatHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
}

export default function NewChatHeader({ title, subtitle, onBack }: NewChatHeaderProps) {
    return (
        <header className="h-[60px] flex items-center px-4 bg-[#202c33] gap-4 shrink-0 text-[#e9edef]">
            {onBack && (
                <button
                    onClick={onBack}
                    className="p-1 hover:bg-[#374248] rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-[#aebac1]" />
                </button>
            )}

            <div className="flex flex-col justify-center">
                <h1 className="text-[19px] font-medium leading-6">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs text-[#8696a0]">{subtitle}</p>
                )}
            </div>
        </header>
    );
}
