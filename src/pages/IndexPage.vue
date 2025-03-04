<template>
  <div>
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <q-tabs v-model="tab" vertical class="text-teal">
          <q-tab
            v-for="contact in store.contacts"
            :key="contact.name"
            :name="contact.name"
            @click="store.openChat(contact.name)"
            class="tab"
          >
            <template v-slot:default>
              <div class="last-message__wrapper">
                <q-img
                  :src="contact.avatar || placeholderImage"
                  loading="lazy"
                  spinner-color="white"
                  height="40px"
                  style="width: 40px; border-radius: 10px;"
                />
                <div class="last-message__content">
                  <div>
                    <div>{{ contact.name }}</div>
                    <div class="last-message">{{ contact.lastMessage }}...</div>
                  </div>
                  <q-badge v-if="contact.newMessages > 0" rounded color="red" :label="contact.newMessages" />
                </div>
              </div>
            </template>
          </q-tab>
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up" style="height: 100vh">
          <q-tab-panel v-for="contact in store.contacts" :key="contact.name" :name="contact.name" class="dialog">
            <div class="q-pa-md row justify-center">
              <div>
                <q-chat-message
                  v-for="msg in store.messages[contact.name] || []"
                  :key="msg.message"
                  :name="msg.from === 'me' ? 'Me' : contact.name"
                  :text="[msg.message]"
                  :sent="msg.from === 'me'"
                />
              </div>
            </div>

            <div class="message-input">
              <q-input filled v-model="message" label="Type a message..."  style="width: 100%"         outlined
                       @keyup.enter="sendMessage" />
              <q-btn icon="send" color="primary" round @click="sendMessage" />
            </div>

          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useChatStore } from 'stores/chat';
import { WebSocketService } from 'src/services/websocket';

export default {
  setup() {
    const tab = ref<string>("1");
    const splitterModel = ref<number>(20);
    const store = useChatStore();
    const message = ref<string>("");

    const placeholderImage = computed(() =>
      "https://img.freepik.com/free-psd/3d-illustration-person-with-punk-hair-jacket_23-2149436198.jpg?t=st=1740953505~exp=1740957105~hmac=37d6135b6f439b42b31a912d1ad40363037f9778ebd07599549e8dfcef0727a8&w=1480"
    );

    onMounted(() => {
      WebSocketService.connect();
    });

    const sendMessage = () => {
      if (message.value.trim() && tab.value) {
        const msg = { from: 'me', to: tab.value, message: message.value };
        if (store.socket && store.socket.readyState === WebSocket.OPEN) {
          store.socket.send(JSON.stringify(msg));
        }
        store.addMessage(tab.value, message.value, 'me');
        message.value = "";
      }
    };



    return {
      tab,
      splitterModel,
      store,
      placeholderImage,
      message,
      sendMessage
    };
  },
};
</script>

<style scoped>
.last-message__wrapper {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  text-align: start;
  align-items: center;
  width: 100%;
}
.last-message__content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.last-message {
  max-width: 200px;
  min-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  color: darkgray;
  font-size: 10px;
  width: 100%;
}
.dialog {
  width: 100%;
  max-width: 800px;
  position: static;
  top: 0;
  height: fit-content;
}
.tab {
  width: 300px;
  justify-content: space-between;
  display: flex;
  align-items: center;
}
.message-input {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #ddd;
  align-items: center;
}
</style>
