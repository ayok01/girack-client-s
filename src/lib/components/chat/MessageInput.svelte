<script lang="ts">
  import { page } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  let message = ""; //メッセージ入力用

  const dispatch = createEventDispatcher();

  const sendMessage = () => {
    dispatch("send", message);
    message = "";
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    //変換の場合は無視
    if (
      navigator.platform.toUpperCase().indexOf("MAC") >= 0 &&
      event.keyCode === 229
    ) {
      return;
    }
    if (event.key === "Enter" && event.ctrlKey) {
      return;
    }
    if (event.key === "Enter") {
      sendMessage();
    }
  };
</script>

<input
  type="text"
  bind:value={message}
  placeholder="メッセージを入力"
  class="flex-grow p-2 border rounded-l-lg"
  on:keydown={handleKeyDown}
/>
<button on:click={sendMessage} class="p-2 bg-blue-500 text-white rounded-r-lg"
  >Send</button
>
