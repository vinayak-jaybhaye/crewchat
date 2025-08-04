'use client'

import { useEffect, useState } from "react";

function isYouTubeUrl(url: string): boolean {
    return /(?:youtube\.com|youtu\.be)/.test(url);
}

function extractYouTubeId(url: string): string | null {
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function LinkPreview({ url }: { url: string }) {
    const [preview, setPreview] = useState<null | {
        title?: string;
        description?: string;
        image?: string;
        siteName?: string;
    }>(null);

    useEffect(() => {
        if (!url) return;

        fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setPreview(data);
                }
            })
            .catch(console.error);
    }, [url]);

    if (!preview) {
        return (
            <div className="mb-2 text-blue-500 underline break-words">
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
            </div>
        );
    }

    const youTubeId = isYouTubeUrl(url) ? extractYouTubeId(url) : null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 block max-w-76 border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition duration-300"
        >
            {youTubeId ? (
                <div className="aspect-video w-full">
                    <iframe
                        src={`https://www.youtube.com/embed/${youTubeId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            ) : (
                preview.image && (
                    <div className="w-full h-32 w-36 overflow-hidden">
                        <img
                            src={preview.image}
                            alt={preview.title || "Link preview"}
                            width={144}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )
            )}

            <div className="p-4">
                {preview.siteName && <div className="text-xs text-gray-400">{preview.siteName}</div>}
                {preview.title && <div className="font-semibold text-base text-gray-800 truncate">{preview.title}</div>}
                {preview.description && (
                    <div className="text-sm text-gray-600 mt-1 line-clamp-3">{preview.description}</div>
                )}
                <div className="text-xs text-blue-500 mt-2 break-words">{url}</div>
            </div>
        </a>
    );
}

export default LinkPreview;
