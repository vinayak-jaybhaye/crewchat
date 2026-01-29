import { ArrowLeft } from "lucide-react";

interface NewChatHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function NewChatHeader({ title, subtitle, onBack }: NewChatHeaderProps) {
  return (
    <header className="h-[60px] flex items-center px-4 bg-surface-default text-text-primary gap-4 shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="p-1 bg-surface-default hover:bg-surface-selected rounded-full hover:scale-110 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      <div className="flex flex-col justify-center">
        <h1 className="text-text-primary font-medium leading-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-text-muted">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
