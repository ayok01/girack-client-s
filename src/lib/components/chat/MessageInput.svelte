<script lang="ts">
  import { socket } from "$lib/socketHandler/socketInit";
  import { page } from "$app/stores";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
  import { get } from "svelte/store";
  import { tick } from "svelte";

  const channelId = $page.params.slug;
  let message = ""; //メッセージ入力用

  const scroolBottom = async () => {
    // ページ遷移時にスクロール位置を一番下に設定
    await tick();
    setTimeout(() => {
      console.log("DOM更新完了");
      const chatContainer = document.getElementById("chatContainer");
      console.log("chatContainer", chatContainer);
      if (chatContainer) {
        console.log("scrollIntoView", chatContainer.scrollHeight);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        console.log("scrollIntoView", chatContainer.scrollTop);
      }
    }, 8);
  };

  /**
   * メッセージを送信する
   */
  const sendMessage = () => {
    //console.log("Input :: sendMessage : userId->", channelId, $page);
    socket.emit("sendMessage", {
      RequestSender: {
        userId: get(userStore).userId,
        sessionId: get(sessionIdStore),
      },
      message: {
        channelId: channelId,
        content: message,
        fileId: [],
      },
    });
    message = "";
    scroolBottom();
  };
</script>

<input
  type="text"
  bind:value={message}
  placeholder="メッセージを入力"
  class="flex-grow p-2 border rounded-l-lg"
/>
<button on:click={sendMessage} class="p-2 bg-blue-500 text-white rounded-r-lg"
  >Send</button
>
