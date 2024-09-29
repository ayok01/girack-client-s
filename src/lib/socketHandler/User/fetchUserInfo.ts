import type { Socket } from "socket.io-client";
import { userStore } from "$lib/store/userInfoStore";
import type { IUserinfo } from "$lib/type/user";
import { get } from "svelte/store";

/**
 * ユーザーの情報を受け取る
 * @param socket
 */
export default function fetchUserInfo(socket: Socket) {
  socket.on(
    "RESULT::fetchUserInfo",
    (dat: { result: string; data: IUserinfo | null }) => {
      console.log("socket(fetchUserInfo) :: dat->", dat);
      if (dat.data !== null) {
        //自分のユーザーIdと同じユーザー情報なら自分の情報として格納する
        if (dat.data.userId === get(userStore).userId) {
          userStore.set(dat.data);
        }
      }
    },
  );
}
