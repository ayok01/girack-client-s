import { writable } from "svelte/store";
import type { IMyUserinfo } from "$lib/type/user";

const initialUserinfo: IMyUserinfo = {
  userName: "",
  role: [],
  userId: "",
  banned: false,
  channelJoined: [],
};

export const userStore = writable<IMyUserinfo>(initialUserinfo);
export const sessionIdStore = writable<string>("");
