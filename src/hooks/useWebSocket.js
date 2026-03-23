import { useState, useEffect, useCallback, useRef } from "react";

const WS_PORTS = [3001, 3002, 3003];

export default function useWebSocket(channel = "cyber") {
  const [data, setData] = useState({ articles: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const portIndexRef = useRef(0);

  const connectWs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= 1) return;

    const port = WS_PORTS[portIndexRef.current % WS_PORTS.length];
    const url = `ws://localhost:${port}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      portIndexRef.current = WS_PORTS.indexOf(port);
      setConnected(true);
      setError(null);
      // Subscribe to channel
      ws.send(JSON.stringify({ type: "subscribe", channel }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "feed-update" && (!msg.channel || msg.channel === channel)) {
          setData({ articles: msg.articles || [], stats: msg.stats || {} });
          setLastRefresh(new Date());
          setLoading(false);
          setError(null);
        } else if (msg.type === "loading") {
          setLoading(true);
        } else if (msg.type === "error") {
          setError(msg.message);
          setLoading(false);
        }
      } catch (e) {
        console.error("[WS] Parse error:", e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connectWs, 3000);
    };

    ws.onerror = () => {
      portIndexRef.current = (portIndexRef.current + 1) % WS_PORTS.length;
      if (portIndexRef.current === 0) {
        setError("Cannot connect to backend. Is the server running?");
      }
      ws.close();
    };
  }, [channel]);

  useEffect(() => {
    connectWs();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWs]);

  const requestRefresh = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      setLoading(true);
      wsRef.current.send(JSON.stringify({ type: "refresh", channel }));
    }
  }, [channel]);

  return { articles: data.articles, stats: data.stats, loading, error, connected, lastRefresh, requestRefresh };
}
