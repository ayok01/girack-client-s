import type { Socket } from "socket.io-client";
import { chatStore } from "$lib/store/messageStore";
import type IMessage from "$lib/type/message";

export default function receiveMessage(socket: Socket): void {
  // URLからチャンネルIDを取得
  // URL = http://localhost:5432/chat/0001 の場合、channelId = 0001
  const channelId = location.pathname.split("/")[2];
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
