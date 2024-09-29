import type { Socket } from "socket.io-client";
import { chatStore } from "$lib/store/messageStore";
import type { IChatHistory } from "$lib/type/message";
import { get } from "svelte/store";

/**
 * チャット履歴を受け取る
 * @param socket ソケットインスタンス
 */
export default function fetchHistory(socket: Socket) {
  socket.on(
    "RESULT::fetchHistory",
    (dat: { result: string; data: IChatHistory | null }) => {
      console.log("socket(fetchHistory) :: dat->", dat);

      if (dat.data !== null) {
        if (!dat.data.historyData) {
          chatStore.set({
            channelId: "",
            historyData: {
              history: [],
              atTop: false,
              atEnd: false,
            },
          });
        }
        // 現在のチャット履歴を取得
        const currentHistory = get(chatStore);

        // チャンネルIDが異なる場合、チャット履歴を初期化
        if (currentHistory.channelId !== dat.data.channelId) {
          chatStore.update((chat) => {
            chat.channelId = "";
            chat.historyData = {
              history: [],
              atTop: false,
              atEnd: false,
            };
            return chat;
          });
        }

        // チャット履歴を更新
        chatStore.update((chat) => {
          chat.channelId = dat.data?.channelId ?? "";

          // 現在の履歴データを取得
          const currentHistory = chat.historyData.history;

          // 新しい履歴データとマージ
          const newHistory = dat.data?.historyData.history ?? [];
          const mergedHistory = [...currentHistory, ...newHistory];

          // 重複を排除するために一意のメッセージIDでフィルタリング
          const uniqueHistory = Array.from(
            new Set(mergedHistory.map((message) => message.messageId)),
          )
            .map((id) =>
              mergedHistory.find((message) => message.messageId === id),
            )
            .filter(
              (message): message is (typeof mergedHistory)[0] =>
                message !== undefined,
            );

          // 更新された履歴データをストアに格納
          chat.historyData = {
            history: uniqueHistory,
            atTop: dat.data?.historyData.atTop ?? false,
            atEnd: dat.data?.historyData.atEnd ?? false,
          };
          return chat;
        });
      }
    },
  );
}
