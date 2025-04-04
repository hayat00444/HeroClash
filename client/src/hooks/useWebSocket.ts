import { useEffect, useRef, useState, useCallback } from "react";

export default function useWebSocket(path: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Setup WebSocket connection
  const connect = useCallback(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Create WebSocket URL, supporting GitHub Pages deployment
    let wsUrl: string;
    
    // Check if we have an explicit API URL from environment variables
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (apiUrl) {
      // For production deployment (GitHub Pages)
      const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
      const apiHostname = new URL(apiUrl).host;
      wsUrl = `${wsProtocol}//${apiHostname}${path}`;
    } else {
      // For local development
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}${path}`;
    }
    
    console.log("Connecting to WebSocket at:", wsUrl);
    
    // Create new WebSocket
    const ws = new WebSocket(wsUrl);

    // Setup event handlers
    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      
      // Attempt to reconnect after delay
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      setLastMessage(event.data);
    };

    webSocketRef.current = ws;

    // Cleanup function
    return () => {
      ws.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [path]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  // Send message function
  const sendMessage = useCallback((message: string) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(message);
      return true;
    }
    return false;
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
