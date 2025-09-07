'use client';

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ title }: { title: string }) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-4 sm:gap-6 px-4 py-3 sm:py-4">
            <ArrowLeft
                onClick={() => router.back()}
                className="cursor-pointer text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200 h-6 w-6 sm:h-7 sm:w-7"
            />
            <h1 className="font-bold text-[var(--text-secondary)] text-xl sm:text-2xl md:text-3xl lg:text-4xl truncate">
                {title}
            </h1>
        </div>
    );
}
