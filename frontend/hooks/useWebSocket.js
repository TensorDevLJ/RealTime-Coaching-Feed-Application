import { useEffect, useState, useRef } from 'react';
import { getSocket } from '../socket/socket';

export function useWebSocket(
  onFeedCreated,
  onFeedDeleted,
  onClientsUpdated
) {

  const [isConnected, setIsConnected] = useState(false);

  const [clientCount, setClientCount] = useState(0);

  const handledEvents = useRef(new Set());

  useEffect(() => {

    // Get SINGLE socket instance
    const socket = getSocket();

    // connect only once
    if (!socket.connected) {
      socket.connect();
    }

    // duplicate prevention
    const preventDuplicate = (id) => {

      if (handledEvents.current.has(id)) {
        return false;
      }

      handledEvents.current.add(id);

      if (handledEvents.current.size > 100) {
        handledEvents.current.clear();
      }

      return true;
    };


    // connected
    const connectHandler = () => {

      console.log(
        "🟢 Connected:",
        socket.id
      );

      setIsConnected(true);

      socket.emit(
        "subscribe:feeds"
      );

    };


    // disconnected
    const disconnectHandler = () => {

      console.log(
        "🔴 Disconnected"
      );

      setIsConnected(false);

    };


    // feed created
    const createdHandler = (data) => {

      const eventId =
        `${data.feed.id}-${data.timestamp}`;

      if (
        preventDuplicate(eventId)
      ) {

        onFeedCreated?.(
          data.feed
        );

      }

    };


    // feed deleted
    const deletedHandler = (data) => {

      const eventId =
        `delete-${data.feedId}`;

      if (
        preventDuplicate(eventId)
      ) {

        onFeedDeleted?.(
          data.feedId
        );

      }

    };


    // client count
    const clientsHandler = (data) => {

      setClientCount(
        data.count
      );

      onClientsUpdated?.(
        data.count
      );

    };


    socket.on(
      "connect",
      connectHandler
    );

    socket.on(
      "disconnect",
      disconnectHandler
    );

    socket.on(
      "feed:created",
      createdHandler
    );

    socket.on(
      "feed:deleted",
      deletedHandler
    );

    socket.on(
      "clients:updated",
      clientsHandler
    );


    // cleanup
    return () => {

      socket.off(
        "connect",
        connectHandler
      );

      socket.off(
        "disconnect",
        disconnectHandler
      );

      socket.off(
        "feed:created",
        createdHandler
      );

      socket.off(
        "feed:deleted",
        deletedHandler
      );

      socket.off(
        "clients:updated",
        clientsHandler
      );

      // DO NOT disconnect here

    };

  }, []);


  return {

    isConnected,

    clientCount

  };

}

export default useWebSocket;