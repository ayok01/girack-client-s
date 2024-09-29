import { Socket } from "socket.io-client";
import {
  userListStore,
  userStore,
  sessionIdStore,
} from "$lib/store/userInfoStore";
import { get } from "svelte/store";
import type { IUserinfo } from "$lib/type/user";
import { socket } from "../socketInit";

/**
 * 全てのユーザー情報を受け取る
 */
export default function fetchUserAll(socket: Socket) {
  console.log("fetchUserAll :: fetchUserAll ->");
  socket.on(
    "RESULT::fetchUserAll",
    (dat: {
      result: string;
      data: { datUser: { [key: string]: IUserinfo }; countUser: number } | null;
    }) => {
      console.log("socket(fetchUserAll) :: dat->", dat);
      if (dat.data !== null) {
        //全てのユーザー情報を格納
        //重複しているユーザー情報は上書きする
        const userList = get(userListStore);
        userListStore.set({ ...userList, ...dat.data.datUser });

        //全てのユーザーが格納されているか確認
        if (Object.keys(userList).length >= dat.data.countUser) {
          console.log("全てのユーザー情報を取得しました");
        } else {
          const myUSerInfo = get(userStore);
          const sesssionId = get(sessionIdStore);
          fetchUserAllEmit(
            myUSerInfo.userId,
            sesssionId,
            Object.keys(userList).length / 30 + 1,
          );
        }
      }
    },
  );
}

/**
 * 全てのユーザー情報を取得する
 */
export function fetchUserAllEmit(
  userId: string,
  sessionId: string,
  indexPage: number,
) {
  console.log("fetchUserAll :: fetchUserAllEmit ->");
  socket.emit("fetchUserAll", {
    RequestSender: {
      userId: userId,
      sessionId: sessionId,
    },
    indexPage: indexPage,
  });
}
