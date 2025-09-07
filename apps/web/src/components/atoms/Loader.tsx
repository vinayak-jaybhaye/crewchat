'use client'

import React from 'react';

interface LoaderProps {
    title?: string;
    size?: number;
    color?: string;
    secondaryColor?: string;
    speed?: string;
}

const Loader: React.FC<LoaderProps> = ({
    title = 'Loading...',
    size = 40,
    color = '#1976d2',
    secondaryColor = '#e0e0e0',
    speed = '1s'
}) => (
    <div
        role="status"
        aria-live="polite"
        aria-label={title}
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
        }}
    >
        <div
            style={{
                width: size,
                height: size,
                border: `4px solid ${secondaryColor}`,
                borderTop: `4px solid ${color}`,
                borderRadius: '50%',
                animation: `spin ${speed} linear infinite`,
            }}
        />
        <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    </div>
);

export default Loader;