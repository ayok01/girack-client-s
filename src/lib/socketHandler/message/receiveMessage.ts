import type { Socket } from "socket.io-client";
import { chatStore } from "$lib/store/messageStore";
import type IMessage from "$lib/type/message";

export default function receiveMessage(socket: Socket): void {
  socket.on("receiveMessage", (message: IMessage) => {
    chatStore.update((chat) => {
      chat.historyData.history.push(message);
      return chat;
    });
  });
}
