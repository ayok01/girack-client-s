import type { Socket } from "socket.io-client";
import { chatStore } from "$lib/store/messageStore";
import type IMessage from "$lib/type/message";

export default function receiveMessage(socket: Socket): void {
  socket.on("receiveMessage", (message: IMessage) => {
    console.log("socket(receiveMessage) :: message->", message);
    //チャット履歴の先頭にメッセージを追加
    chatStore.update((chat) => {
      chat.historyData.history.unshift(message);
      return chat;
    });
  });
}
