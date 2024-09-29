<script>
  import { goto } from "$app/navigation";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
  import { channelStore } from "$lib/store/channelStore";
  import { get } from "svelte/store";
  import { socket } from "$lib/socketHandler/socketInit";

  const userInfo = get(userStore);
  const sessionId = get(sessionIdStore);
  const channelInfo = get(channelStore);

  if (!channelInfo) {
    socket.emit("fetchChannelList", {
      RequestSender: {
        userId: userInfo.userId,
        sessionId: sessionId,
      },
    });
  } else {
    // チャンネル情報が取得できたらメッセージを取得する
    channelInfo.forEach((channel) => {
      socket.emit("fetchHistory", {
        RequestSender: {
          userId: userInfo.userId,
          sessionId: sessionId,
        },
        channelId: channel.channelId,
        fetchingPosition: {
          positionMessageId: "",
          includeThisPosition: true,
          fetchDirection: "older",
        },
      });
    });
  }

  // ローカルストレージに保存されているパスを取得
  const path = localStorage.getItem("currentPath");
  if (path && path !== "/auth") {
    goto(path);
  } else {
    goto("/chat");
  }
</script>
