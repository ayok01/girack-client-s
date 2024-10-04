//メッセージの削除

import type { Socket } from "socket.io-client"; //クラス識別用
import { chatStore } from "$lib/store/messageStore";

export default function deleteMessage(socket: Socket): void {
  //メッセ削除
  socket.on(
    "RESULT::deleteMessage",
    (dat: {
      result: string;
      data: {
        channelId: string;
        messageId: string;
      };
    }) => {
      //メッセージ削除
      chatStore.update((chat) => {
        chat.historyData.history = chat.historyData.history.filter(
          (message) => message.messageId !== dat.data.messageId,
        );
        return chat;
      });
    },
  );
}
