import { writable } from "svelte/store";

export const chatLoadingStore = writable<boolean>(false);
