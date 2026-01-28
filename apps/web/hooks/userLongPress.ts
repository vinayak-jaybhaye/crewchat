import { useRef } from "react";

export function useLongPress(
    callback: () => void,
    delay = 500
) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startPos = useRef<{ x: number; y: number } | null>(null);

    const start = (e: React.PointerEvent) => {
        startPos.current = { x: e.clientX, y: e.clientY };

        timer.current = setTimeout(() => {
            callback();
        }, delay);
    };

    const cancel = () => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    };

    const move = (e: React.PointerEvent) => {
        if (!startPos.current) return;

        const dx = Math.abs(e.clientX - startPos.current.x);
        const dy = Math.abs(e.clientY - startPos.current.y);

        // cancel if user is scrolling
        if (dx > 10 || dy > 10) cancel();
    };

    return {
        onPointerDown: start,
        onPointerUp: cancel,
        onPointerLeave: cancel,
        onPointerCancel: cancel,
        onPointerMove: move,
    };
}
