<script lang="ts">
  import { socket } from "$lib/socketHandler/socketInit";
  import { page } from "$app/stores";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
  import { get } from "svelte/store";

  const channelId = $page.route.id;
  let message = ""; //メッセージ入力用

  /**
   * メッセージを送信する
   */
  const sendMessage = () => {
    console.log("Input :: sendMessage : userId->", channelId);
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
  };
</script>

<input
  type="text"
  bind:value={message}
  placeholder="Type your message..."
  class="flex-grow p-2 border rounded-l-lg"
/>
<button on:click={sendMessage} class="p-2 bg-blue-500 text-white rounded-r-lg"
  >Send</button
>
