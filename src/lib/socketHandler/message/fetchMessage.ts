import type { Socket } from "socket.io-client";
import { chatStore } from "$lib/store/messageStore";
import type  {IChatHistory} from "$lib/type/message";

/**
 * チャット履歴を受け取る
 * @param socket
 */
export default function fetchHistory(socket: Socket) {
  socket.on("RESULT::fetchHistory", (dat: { result: string, data: IChatHistory | null }) => {
    console.log("socket(fetchHistory) :: dat->", dat);
    if (dat.data !== null) {
      // チャット履歴を格納
        chatStore.update((chat) => {
            chat.channelId = dat.data?.channelId ?? "";
            chat.historyData = dat.data?.historyData ?? { history: [], atTop: false, atEnd: false };
            return chat;
        });
    }
  });
}