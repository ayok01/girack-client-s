//オンラインユーザーの追加

import type { Socket } from "socket.io-client"; //クラス識別用
import { onlineUserListStore } from "$lib/store/userInfoStore";

export default function addOnlineUser(socket: Socket): void {
  socket.on("addOnlineUser", (dat: { data: string }) => {
    // console.log("socket(addOnlineUser) :: dat->", dat);

    //オンラインユーザーリストに追加
    onlineUserListStore.update((onlineUser) => {
      //重複無視
      if (onlineUser.includes(dat.data)) {
        return onlineUser;
      } else {
        onlineUser.push(dat.data);
        return onlineUser;
      }
    });
  });
}
