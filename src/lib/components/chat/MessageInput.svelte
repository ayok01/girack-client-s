<script lang="ts">
  import { page } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  let message = ""; //メッセージ入力用
  let textarea: HTMLTextAreaElement;

  const dispatch = createEventDispatcher();

  const sendMessage = () => {
    // メッセージが空文字または改行だけの場合は無視
    if (message.trim() === "") {
      return;
    }
    dispatch("send", message);
    message = ""; // メッセージをリセット
    adjustTextareaHeight(); // メッセージ送信後に高さをリセット
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
    // Shift + Enterで改行を追加
    if (event.key === "Enter" && event.shiftKey) {
      setTimeout(adjustTextareaHeight, 0); // 改行後に高さを調整
      return;
    }
    if (event.key === "Enter") {
      sendMessage();
      event.preventDefault(); // Enterキーのデフォルト動作を防ぐ
    }
  };

  const adjustTextareaHeight = () => {
    if (textarea) {
      textarea.style.height = "10px"; // 一旦高さをリセット
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"; // 最大200pxまで広げる
    }
  };
</script>

<textarea
  bind:value={message}
  placeholder="メッセージを入力"
  class="flex-grow p-2 border rounded-l-lg resize-none h-10"
  on:keydown={handleKeyDown}
  bind:this={textarea}
  on:input={adjustTextareaHeight}
/>
<button on:click={sendMessage} class="p-2 bg-blue-500 text-white rounded-r-lg"
  >Send</button
>
