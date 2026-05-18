import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Custom hook to manage Socket.IO connections
 * Handles reconnection, duplicate event prevention, and cleanup
 */
export function useWebSocket(onFeedCreated, onFeedDeleted, onClientsUpdated) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const eventHandledRef = useRef(new Set());
  const reconnectCountRef = useRef(0);

  const handleDuplicateEvents = useCallback((eventId) => {
    // Prevent duplicate event handling
    if (eventHandledRef.current.has(eventId)) {
      console.log('🚫 Duplicate event prevented:', eventId);
      return false;
    }
    eventHandledRef.current.add(eventId);
    
    // Clear old entries after 60 seconds to prevent memory leak
    if (eventHandledRef.current.size > 100) {
      eventHandledRef.current.clear();
    }
    
    return true;
  }, []);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    console.log('🔌 Initializing WebSocket connection...');
    
    const socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    /**
     * Handle connection established
     */
    socket.on('connect', () => {
      console.log('✓ Connected to WebSocket server:', socket.id);
      setIsConnected(true);
      reconnectCountRef.current = 0;

      // Subscribe to feeds room
      socket.emit('subscribe:feeds', { clientId: socket.id });
    });

    /**
     * Handle subscription confirmation
     */
    socket.on('subscription:confirmed', (data) => {
      console.log('📡 Subscription confirmed:', data.room);
    });

    /**
     * Handle feed creation with duplicate prevention
     */
    socket.on('feed:created', (data) => {
      const eventId = `${data.feed.id}-${data.timestamp}`;
      
      if (handleDuplicateEvents(eventId)) {
        console.log('🆕 New feed received:', data.feed.title);
        if (onFeedCreated) {
          onFeedCreated(data.feed);
        }
      }
    });

    /**
     * Handle feed deletion with duplicate prevention
     */
    socket.on('feed:deleted', (data) => {
      const eventId = `delete-${data.feedId}-${data.timestamp}`;
      
      if (handleDuplicateEvents(eventId)) {
        console.log('🗑️ Feed deleted:', data.feedId);
        if (onFeedDeleted) {
          onFeedDeleted(data.feedId);
        }
      }
    });

    /**
     * Handle client count updates
     */
    socket.on('clients:updated', (data) => {
      console.log('👥 Active clients:', data.count);
      setClientCount(data.count);
      if (onClientsUpdated) {
        onClientsUpdated(data.count);
      }
    });

    /**
     * Handle pong response for keep-alive
     */
    socket.on('pong', (data) => {
      console.log('💓 Pong received');
    });

    /**
     * Handle connection errors
     */
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setIsConnected(false);
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket:', reason);
      setIsConnected(false);
    });

    /**
     * Handle reconnection attempts
     */
    socket.on('reconnect_attempt', () => {
      reconnectCountRef.current++;
      console.log(`🔄 Reconnect attempt ${reconnectCountRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
    });

    /**
     * Send keep-alive ping every 30 seconds
     */
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    /**
     * Cleanup on unmount
     */
    return () => {
      clearInterval(pingInterval);
      if (socket.connected) {
        socket.emit('unsubscribe:feeds');
        socket.disconnect();
      }
    };
  }, [onFeedCreated, onFeedDeleted, onClientsUpdated, handleDuplicateEvents]);

  return {
    isConnected,
    clientCount,
    socket: socketRef.current,
  };
}

export default useWebSocket;
