//オンラインユーザーの取得

import type { Socket } from "socket.io-client"; //クラス識別用
import { onlineUserListStore } from "$lib/store/userInfoStore";

export default function fetchOnlineUsers(socket: Socket): void {
  socket.on(
    "RESULT::fetchOnlineUsers",
    (dat: { result: string; data: string[] }) => {
      // console.log("socket(fetchOnlineUsers) :: dat->", dat);
      onlineUserListStore.set(dat.data);
    },
  );
}
