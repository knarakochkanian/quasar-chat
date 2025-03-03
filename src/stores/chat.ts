import { defineStore } from 'pinia';

interface Contact {
  name: string;
  lastMessage: string;
  newMessages: number;
  avatar?: string;
}

interface Message {
  from: string;
  message: string;
}

const controllerServerAddress = 'ws://localhost:8181/ws';

export const useChatStore = defineStore('counter', {
  state: () => ({
    counter: 0,
    contacts: [] as Contact[],
    messages: {} as Record<string, Message[]>,
    socket: null as WebSocket | null,
    pingFailed: false,
    modalVisible: false,
    text: '',
    addNotification: '',
    addMessage: false,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    connectWebSocket() {
      this.socket = new WebSocket(controllerServerAddress);
      console.log(`Attempting to connect WebSocket to ${controllerServerAddress}`);

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.pingFailed = false;
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed, retrying...');
        this.retryConnection();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.pingFailed = true;
        this.modalVisible = true;
        this.retryConnection();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received WebSocket Message:", data);

          if (data.message) {
            this.addMessage(data.message.from, data.message.message);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    },

    retryConnection() {
      setTimeout(() => {
        console.log('Retrying WebSocket connection...');
        this.connectWebSocket();
      }, 1000);
    },

    addMessage(from: string, message: string, avatar: string = '') {
      let contact = this.contacts.find((c) => c.name === from);
      if (!contact) {
        contact = { name: from, lastMessage: message, newMessages: 1, avatar };
        this.contacts.unshift(contact);
      } else {
        contact.lastMessage = message;
        contact.newMessages += 1;
        contact.avatar = avatar || contact.avatar || '';
      }

      if (!this.messages[from]) {
        this.messages[from] = [];
      }
      this.messages[from].push({ from, message });
    },

    saveMessage(contactName: string) {
      if (this.text.trim()) {
        this.addMessage(contactName, this.text);
        this.text = '';
      }
    },


    openChat(contactName: string) {
      const contact = this.contacts.find((contact) => contact.name === contactName);
      if (contact) {
        contact.newMessages = 0;
      }
    },

  },
});
