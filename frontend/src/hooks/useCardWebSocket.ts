import { useEffect, useRef, useCallback, useState } from 'react';
import { Card, ColumnId } from '../types';

export interface CardMovedMessage {
  type: 'card_moved';
  cardId: string;
  fromColumn: ColumnId;
  toColumn: ColumnId;
  card: Card;
  timestamp: string;
}

export interface CardUpdatedMessage {
  type: 'card_updated';
  cardId: string;
  card: Card;
  timestamp: string;
}

export interface CardCreatedMessage {
  type: 'card_created';
  cardId: string;
  card: Card;
  timestamp: string;
}

type WebSocketMessage = CardMovedMessage | CardUpdatedMessage | CardCreatedMessage;

interface UseCardWebSocketProps {
  onCardMoved?: (message: CardMovedMessage) => void;
  onCardUpdated?: (message: CardUpdatedMessage) => void;
  onCardCreated?: (message: CardCreatedMessage) => void;
  enabled?: boolean;
}

export function useCardWebSocket({
  onCardMoved,
  onCardUpdated,
  onCardCreated,
  enabled = true
}: UseCardWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!enabled) return;

    console.log('[CardWS] Connecting to cards WebSocket...');
    const ws = new WebSocket(`ws://localhost:3001/api/cards/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log('[CardWS] Connected successfully');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('[CardWS] Disconnected');

      // Reconnect with exponential backoff
      if (enabled && reconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        reconnectAttemptsRef.current++;

        console.log(`[CardWS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('[CardWS] WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'card_moved':
            console.log(`[CardWS] Card ${message.cardId} moved from ${message.fromColumn} to ${message.toColumn}`);
            onCardMoved?.(message);
            break;
          case 'card_updated':
            console.log(`[CardWS] Card ${message.cardId} updated`);
            onCardUpdated?.(message);
            break;
          case 'card_created':
            console.log(`[CardWS] Card ${message.cardId} created`);
            onCardCreated?.(message);
            break;
        }
      } catch (error) {
        console.error('[CardWS] Failed to parse message:', error);
      }
    };

    wsRef.current = ws;
  }, [enabled, onCardMoved, onCardUpdated, onCardCreated]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  return { isConnected };
}
