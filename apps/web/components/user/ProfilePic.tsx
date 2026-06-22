'use client';

import React from 'react';
import Image from 'next/image';

interface ProfilePicProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  onClick?: () => void;
  alt?: string;
}

export default function ProfilePic({
  src,
  name,
  size = 10,
  className = '',
  onClick,
  alt
}: ProfilePicProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div
      className={`shrink-0 rounded-full bg-bg-muted flex items-center justify-center overflow-hidden border border-border-subtle transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-accent-primary/40 hover:ring-2 hover:ring-accent-primary/10' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Profile picture"}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      ) : (
        <span
          className="text-text-muted font-semibold select-none"
          style={{ fontSize: Math.max(12, size * 0.4) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}