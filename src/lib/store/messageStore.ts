import { writable } from "svelte/store";
import type {IChatHistory} from "$lib/type/message";

const initialChats: IChatHistory = {
    channelId: "",
    historyData: {
        history: [],
        atTop: false,
        atEnd: false,
    },
};

export const chatStore = writable<IChatHistory>(initialChats);