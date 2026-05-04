"use client";

import { useEffect, useRef, useCallback } from "react";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

interface UseWebSocketOptions {
    /** The WebSocket path, e.g. '/ws/notifications/' */
    path: string;
    /** Callback when a message is received */
    onMessage: (data: any) => void;
    /** Whether to auto-connect */
    enabled?: boolean;
}

/**
 * Custom hook to connect to a Django Channels WebSocket endpoint.
 * Handles auto-reconnect, JWT token auth, and cleanup.
 */
export function useWebSocket({ path, onMessage, enabled = true }: UseWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onMessageRef = useRef(onMessage);

    // Keep the callback ref up to date without re-triggering the effect
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        if (!enabled) return;

        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) return;

        const url = `${WS_BASE_URL}${path}?token=${token}`;

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log(`[WS] Connected: ${path}`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessageRef.current(data);
            } catch (err) {
                console.error("[WS] Failed to parse message", err);
            }
        };

        ws.onclose = (event) => {
            console.log(`[WS] Disconnected: ${path} (code: ${event.code})`);
            // Auto-reconnect after 3 seconds (unless intentionally closed)
            if (event.code !== 1000 && enabled) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log(`[WS] Reconnecting: ${path}`);
                    connect();
                }, 3000);
            }
        };

        ws.onerror = (error) => {
            console.error(`[WS] Error on ${path}`, error);
        };
    }, [path, enabled]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounted");
                wsRef.current = null;
            }
        };
    }, [connect]);
}
