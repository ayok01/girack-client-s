import type { Socket } from "socket.io-client";
import { chatStore } from "$lib/store/messageStore";
import type { IMessage } from "$lib/type/message";

// StoreからチャンネルIDを取得
let channelId = "";
chatStore.subscribe((chat) => {
  channelId = chat.channelId;
});

export default function updateMessage(socket: Socket): void {
  socket.on("updateMessage", (dat: { result: string; data: IMessage }) => {
    // console.log("socket(updateMessage) :: message->", dat);
    // チャネルIDが一致する場合、メッセージを更新
    if (channelId !== dat.data.channelId) return;
    chatStore.update((chat) => {
      chat.historyData.history = chat.historyData.history.map((msg) =>
        msg.messageId === dat.data.messageId ? dat.data : msg,
      );
      return chat;
    });
  });
}
