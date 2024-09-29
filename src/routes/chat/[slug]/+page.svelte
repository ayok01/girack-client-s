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
  import { getAvatarUrl } from "$lib/repository/fileRepository";
  import MessageInput from "$lib/components/chat/MessageInput.svelte";

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

  const getUserName = (userId: string) => {
    const getUserList = get(userListStore);
    return getUserList[userId]?.userName || "Unknown User";
  };

  const handleScroll = (event: Event) => {
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0) {
      //会話履歴の最後のメッセージIDを取得
      const currentMessage =
        $chatStore.historyData.history[
          $chatStore.historyData.history.length - 1
        ].messageId;

      if ($chatStore.historyData.atTop) {
        return;
      }
      scroolMessageId();
      fetchHistory(channelId, "older", currentMessage);
    } else if (
      element.scrollHeight - element.scrollTop ===
      element.clientHeight
    ) {
      const currentMessage = $chatStore.historyData.history[0].messageId;
      if ($chatStore.historyData.atEnd) {
        return;
      }
      fetchHistory(channelId, "newer", currentMessage);
    }
  };

  // 会話履歴を取得した時にスクロール位置を指定できるように
  const scroolMessageId = () => {
    const chatContainer = document.getElementById("chatContainer");
    // 一番上のメッセージを取得
    /**
     * <div id="chatContainer">
     *   <div>
     *    <div>メッセージ1</div>
     *   <div>
     * </div>
     */
    const chatContainerTop = chatContainer?.firstElementChild?.lastElementChild;
    if (chatContainerTop) {
      console.log("chatContainerTop", chatContainerTop);
      setTimeout(() => {
        // conatinerの高さを取得
        const containerHeight = chatContainer.clientHeight;
        // 一番上のメッセージの高さを取得
        const topHeight = chatContainerTop.clientHeight;
        //　スクロール
        console.log("scrollIntoView", containerHeight - topHeight + 56);
        chatContainer.scrollTop = containerHeight - topHeight;
      }, 10);
    }
  };

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
            <div class="flex items-start mb-4 gap-2">
              <img
                src={getAvatarUrl(message.userId)}
                alt="Avatar"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div class="flex flex-col">
                <div class="flex items-center">
                  <p class="font-bold">{getUserName(message.userId)}</p>
                  <p class="text-gray-500 text-sm ml-2">
                    {new Date(message.time).toLocaleTimeString()}
                  </p>
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
    <MessageInput />
  </div>
</div>
