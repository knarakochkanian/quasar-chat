import { useChatStore } from 'stores/chat';

let socket: WebSocket | null = null;

export const WebSocketService = {
  connect() {
    if (socket) return;

    socket = new WebSocket("ws://localhost:8181/ws");
    const store = useChatStore();

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket Message:", data);

        if (data.message) {
          store.addMessage(data.message.from, data.message.message, data.message.avatar || '');
        }

      } catch (error) {
        console.error("WebSocket parsing error:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.warn("WebSocket closed. Reconnecting in 5s...");
      socket = null;
      setTimeout(() => WebSocketService.connect(), 5000);
    };
  },

  sendMessage(message: object) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected. Message not sent.");
    }
  },

  disconnect() {
    if (socket) {
      socket.close();
      socket = null;
    }
  },
};
