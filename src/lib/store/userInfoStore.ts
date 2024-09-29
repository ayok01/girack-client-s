import { writable } from "svelte/store";
import type { IUserinfo } from "$lib/type/user";

const initialUserinfo: IUserinfo = {
  userName: "",
  role: [],
  userId: "",
  banned: false,
  channelJoined: [],
};

const initialUserList: { [key: string]: IUserinfo } = {};

export const userListStore = writable<{ [key: string]: IUserinfo }>(
  initialUserList,
);
export const userStore = writable<IUserinfo>(initialUserinfo);
export const sesssionIdStore = writable<string>("");
