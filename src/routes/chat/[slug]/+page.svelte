<script lang="ts">
  import { get } from "svelte/store";
  import { page } from "$app/stores";
  import { socket } from "$lib/socketHandler/socketInit";
  import {
    userStore,
    sesssionIdStore,
    userListStore,
  } from "$lib/store/userInfoStore";
  import { chatStore } from "$lib/store/messageStore";
  import { onMount, tick } from "svelte";
  import receiveMessage from "$lib/socketHandler/message/receiveMessage";

  const getUserInfo = get(userStore);
  const getSesssionIdStore = get(sesssionIdStore);

  // リアクティブにパスを取得
  $: path = $page.url.pathname;
  $: channelId = path.split("/").pop()?.toString() || "";

  onMount(() => {
    console.log("Chat page mounted");
    if (channelId) {
      // ページがマウントされたときに最新のチャット履歴を取得
      fetchHistory(channelId, "older");
    }

    socket.on("historyData", (data) => {
      chatStore.update((store) => {
        store.historyData.history = data.history;
        return store;
      });
    });

    receiveMessage(socket);
    scroolBottom();
  });

  $: {
    if ($page.route.id && channelId) {
      fetchHistory(channelId, "older", "");
      scroolBottom();
    }
  }

  const fetchHistory = (
    channelId: string,
    direction: string,
    positionMessageId: string = "",
  ) => {
    console.log(
      "Fetching history for channel:",
      channelId,
      direction,
      positionMessageId,
    );
    socket.emit("fetchHistory", {
      RequestSender: {
        userId: getUserInfo.userId,
        sessionId: getSesssionIdStore,
      },
      channelId: channelId,
      fetchingPosition: {
        positionMessageId: positionMessageId,
        includeThisPosition: true,
        fetchDirection: direction,
      },
    });
  };

  let newMessageText = "";

  function sendMessage() {
    console.log("Sending message:", newMessageText);
    if (newMessageText.trim() !== "") {
      socket.emit("sendMessage", {
        channelId: channelId,
        userId: getUserInfo.userId,
        content: newMessageText,
      });
      newMessageText = "";
    }
  }

  const getUserName = (userId: string) => {
    const getUserList = get(userListStore);
    return getUserList[userId]?.userName || "Unknown User";
  };

  function handleScroll(event: Event) {
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0) {
      //会話履歴の最後のメッセージIDを取得
      const currentMessage =
        $chatStore.historyData.history[
          $chatStore.historyData.history.length - 1
        ].messageId;
      fetchHistory(channelId, "older", currentMessage);
    } else if (
      element.scrollHeight - element.scrollTop ===
      element.clientHeight
    ) {
      const currentMessage = $chatStore.historyData.history[0].messageId;
      fetchHistory(channelId, "newer", currentMessage);
    }
  }

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
    }, 10);
  };
</script>

<div class="flex flex-col h-[calc(100vh-4rem)] mx-auto">
  <div
    id="chatContainer"
    class="flex-grow overflow-y-auto p-4"
    on:scroll={handleScroll}
  >
    {#if Array.isArray($chatStore.historyData.history)}
      <div class="flex flex-col-reverse">
        {#each $chatStore.historyData.history as message (message.messageId)}
          {#if message.userId !== "SYSTEM"}
            <div class="flex items-start mb-4">
              <img
                src="/bot.png"
                alt="Avatar"
                class="w-8 h-8 rounded-full mr-2"
              />
              <div class="flex flex-col">
                <div class="flex items-center">
                  <p class="font-bold">{getUserName(message.userId)}</p>
                  <p class="text-gray-500 text-sm ml-2">
                    {new Date(message.time).toLocaleTimeString()}
                  </p>
                  {message.messageId}
                </div>
                <p class="bg-gray-200 p-2 rounded-lg">{message.content}</p>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <p>メッセージがありません。</p>
    {/if}
  </div>

  <div class="flex p-4">
    <input
      type="text"
      bind:value={newMessageText}
      placeholder="Type your message..."
      class="flex-grow p-2 border rounded-l-lg"
    />
    <button
      on:click={sendMessage}
      class="p-2 bg-blue-500 text-white rounded-r-lg">Send</button
    >
  </div>
</div>
