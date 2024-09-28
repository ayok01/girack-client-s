import { writable } from "svelte/store";
import type { IChannel } from "$lib/type/channel";

// 全てのチャンネルを格納する配列
const initialChannels: IChannel[] = [];

// チャンネルストアの作成
export const channelStore = writable<IChannel[]>(initialChannels);

// チャンネルを追加する関数
export const addChannel = (newChannel: IChannel) => {
  channelStore.update((channels) => [...channels, newChannel]);
};

// チャンネルを削除する関数
export const removeChannel = (channelId: string) => {
  channelStore.update((channels) =>
    channels.filter((channel) => channel.channelId !== channelId),
  );
};
