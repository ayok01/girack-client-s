import type { Socket } from "socket.io-client";

/**
 * WS接続の検知する
 * @param socket
 */
export default function connect(socket: Socket) {
  socket.on("connect", () => {
    console.log("socket(connect) :: 接続しました!");
  });
}
