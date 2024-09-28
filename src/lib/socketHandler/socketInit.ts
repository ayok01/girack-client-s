import { type Socket, io } from "socket.io-client"; //ウェブソケット通信用

//Socket接続
export const socket: Socket = io({
  path: "/socket.io",
  reconnection: true,
  reconnectionDelay: 100,
  reconnectionDelayMax: 1000,
});

import connect from "./connect";
import disconnect from "./disconnect";

export function loadSocket() {
  console.log("socketInit :: loadSockert : SocketIO接続をロードします");

  connect(socket); //接続の検知
  disconnect(socket); //切断の検知
}