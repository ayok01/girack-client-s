//切断の検知、設定
import type { Socket } from "socket.io-client"; //クラス識別用

/**
 * WSサーバーからの切断を検知
 * @param socket
 */
export default function disconnect(socket: Socket): void {
  socket.on("disconnect", () => {
    console.log("socket(disconnect) :: 切断検知");
  });
}
