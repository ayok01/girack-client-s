import { type Socket, io } from "socket.io-client"; //ウェブソケット通信用
import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";

//Socket接続
export const socket: Socket = io(PUBLIC_BACKEND_ADDRESS, {
  path: "/socket.io",
  reconnection: true,
  reconnectionDelay: 100,
  reconnectionDelayMax: 1000,
});

import connect from "./connect";
import disconnect from "./disconnect";

import fetchUserInfo from "./User/fetchUserInfo";
import fetchChannelList from "./Channel/fetchCannelList";
import fetchHistory from "./message/fetchMessage";
import fetchUserAll from "./User/fetchUserAll";
import receiveMessage from "./message/receiveMessage";
import updateMessage from "./message/updateMessage";

export function loadSocket() {
  console.log("socketInit :: loadSockert : SocketIO接続をロードします");

  connect(socket); //接続の検知
  disconnect(socket); //切断の検知

  fetchUserInfo(socket); //ユーザー情報の受け取り
  fetchChannelList(socket); //チャンネル一覧の受け取り
  fetchHistory(socket); //メッセージの受け取り
  fetchUserAll(socket); //全ユーザー情報の受け取り
  receiveMessage(socket); //メッセージの受け取り
  updateMessage(socket); //メッセージの更新
}
