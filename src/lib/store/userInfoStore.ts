import { derived, writable } from "svelte/store";
import type { IUserinfo } from "$lib/type/user";

const initialUserinfo: IUserinfo = {
  userName: "",
  role: [],
  userId: "",
  banned: false,
  channelJoined: [],
};

const initialOnlineUserList: string[] = [];

const initialUserList: { [key: string]: IUserinfo } = {};

export const userListStore = writable<{ [key: string]: IUserinfo }>(
  initialUserList,
);
export const userStore = writable<IUserinfo>(initialUserinfo);
export const sessionIdStore = writable<string>("");
export const onlineUserListStore = writable<string[]>(initialOnlineUserList);
