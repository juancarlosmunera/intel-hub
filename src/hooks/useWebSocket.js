import { useState, useEffect, useCallback, useRef } from "react";

const WS_PORTS = [3001, 3002, 3003, 3004, 3005];

// Shared working port — once discovered, all hooks use it instantly
let workingPort = null;

function tryConnect(ports) {
  return new Promise((resolve) => {
    const sockets = [];
    let resolved = false;
    for (const port of ports) {
      const ws = new WebSocket(`ws://localhost:${port}`);
      sockets.push(ws);
      ws.onopen = () => {
        if (resolved) { ws.close(); return; }
        resolved = true;
        workingPort = port;
        for (const s of sockets) { if (s !== ws && s.readyState <= 1) s.close(); }
        resolve(ws);
      };
      ws.onerror = () => { ws.close(); };
    }
    setTimeout(() => { if (!resolved) { resolved = true; resolve(null); } }, 5000);
  });
}

export default function useWebSocket(channel = "cyber") {
  const [data, setData] = useState({ articles: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const mountedRef = useRef(true);

  const connectWs = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState <= 1) return;

    let ws;
    if (workingPort) {
      ws = new WebSocket(`ws://localhost:${workingPort}`);
      await new Promise((resolve) => {
        ws.onopen = resolve;
        ws.onerror = () => { workingPort = null; ws.close(); resolve(); };
      });
      if (ws.readyState !== 1) {
        ws = await tryConnect(WS_PORTS);
      }
    } else {
      ws = await tryConnect(WS_PORTS);
    }

    if (!ws || !mountedRef.current) {
      if (mountedRef.current) {
        setError("Cannot connect to backend. Is the server running?");
        reconnectTimer.current = setTimeout(connectWs, 3000);
      }
      return;
    }

    wsRef.current = ws;
    setConnected(true);
    setError(null);

    // Set up message handler BEFORE subscribing to avoid race condition
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
      if (!mountedRef.current) return;
      setConnected(false);
      reconnectTimer.current = setTimeout(connectWs, 3000);
    };

    ws.onerror = () => {};

    // Subscribe AFTER handler is set up
    ws.send(JSON.stringify({ type: "subscribe", channel }));
  }, [channel]);

  useEffect(() => {
    mountedRef.current = true;
    connectWs();
    return () => {
      mountedRef.current = false;
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
