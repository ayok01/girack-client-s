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
  }
  //ローカルストレージに保存されているパスを取得
  const path = localStorage.getItem("currentPath");
  if (path && path !== "/auth") {
    goto(path);
  } else {
    goto("/chat");
  }
</script>
