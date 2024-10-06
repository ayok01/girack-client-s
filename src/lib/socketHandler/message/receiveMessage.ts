import type { Socket } from "socket.io-client";
import { chatStore } from "$lib/store/messageStore";
import type { IMessage } from "$lib/type/message";
// StoreからチャンネルIDを取得
let channelId = "";
chatStore.subscribe((chat) => {
  channelId = chat.channelId;
});

export default function receiveMessage(socket: Socket): void {
  socket.on("receiveMessage", (message: IMessage) => {
    console.log("socket(receiveMessage) :: message->", message);
    //チャット履歴の先頭にメッセージを追加
    if (channelId !== message.channelId) return;
    chatStore.update((chat) => {
      chat.historyData.history.unshift(message);
      return chat;
    });
  });
}
