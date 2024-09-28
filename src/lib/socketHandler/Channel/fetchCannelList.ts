import type { Socket } from "socket.io-client";
import { channelStore } from "$lib/store/channelStore";
import type { IChannel} from "$lib/type/channel";

/**
 * チャンネル一覧を受け取る
 * @param socket
 */
export default function fetchChannelList (socket: Socket)  {
  socket.on("RESULT::fetchChannelList", (dat: { result: string, data: IChannel[]|null }) => {
    console.log("socket(fetchChannelList) :: dat->", dat);
    if (dat.data !== null) {
      // チャンネル一覧を格納
          channelStore.set(dat.data);
      if (dat.data.length > 0) {
      }else{
      }
    }
  });
}
