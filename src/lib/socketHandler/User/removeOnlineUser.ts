//オンラインユーザーの切断を受信

import type { Socket } from "socket.io-client"; //クラス識別用
import { onlineUserListStore } from "$lib/store/userInfoStore";

export default function removeOnlineUser(socket: Socket): void {
  socket.on("removeOnlineUser", (dat: { data: string }) => {
    // console.log("socket(removeOnlineUser) :: dat->", dat);

    //オンラインユーザーリストから削除
    onlineUserListStore.update((onlineUser) => {
      onlineUser = onlineUser.filter((user) => user !== dat.data);
      return onlineUser;
    });
  });
}
