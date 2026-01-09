import { useEffect, useRef, useCallback, useState } from 'react';

interface ExecutionCompleteMessage {
  type: 'execution_complete';
  cardId: string;
  status: 'success' | 'error';
  command: string;
  tokenStats?: { inputTokens: number; outputTokens: number; totalTokens: number };
  costStats?: { totalCost: number; planCost: number; implementCost: number; testCost: number; reviewCost: number };
  error?: string;
  timestamp: string;
}

interface LogMessage {
  type: 'log';
  cardId: string;
  logType: string;
  content: string;
  timestamp: string;
}

type WebSocketMessage = ExecutionCompleteMessage | LogMessage;

export function useExecutionWebSocket(
  cardId: string | null,
  onComplete?: (msg: ExecutionCompleteMessage) => void,
  onLog?: (msg: LogMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!cardId) return;

    // Usar porta 3001 para o backend
    const ws = new WebSocket(`ws://localhost:3001/api/execution/ws/${cardId}`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log(`[ExecutionWS] Connected for card ${cardId.slice(0, 8)}`);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log(`[ExecutionWS] Disconnected for card ${cardId.slice(0, 8)}`);

      // Tentar reconectar apos 5 segundos
      reconnectTimeoutRef.current = setTimeout(() => {
        if (cardId) {
          console.log(`[ExecutionWS] Attempting reconnect for card ${cardId.slice(0, 8)}`);
          connect();
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error(`[ExecutionWS] Error for card ${cardId.slice(0, 8)}:`, error);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data);

        if (msg.type === 'execution_complete' && onComplete) {
          onComplete(msg as ExecutionCompleteMessage);
        } else if (msg.type === 'log' && onLog) {
          onLog(msg as LogMessage);
        }
      } catch (error) {
        console.error('[ExecutionWS] Failed to parse message:', error);
      }
    };

    wsRef.current = ws;
  }, [cardId, onComplete, onLog]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
