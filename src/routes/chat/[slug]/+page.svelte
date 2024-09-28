<script lang="ts">
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import { socket } from '$lib/socketHandler/socketInit';
  import { userStore, sesssionIdStore } from '$lib/store/userInfoStore';
  import { chatStore } from '$lib/store/messageStore';
  import { onMount } from 'svelte';

  const getUserInfo = get(userStore);
  const getSesssionIdStore = get(sesssionIdStore);

  onMount(() => {
    const path = window.location.pathname;
    const slug = path.split('/').pop()?.toString();
    if (slug) {
      fetchHistory(slug);
    }
  });

  $: {
    // チャンネルが変更されたときに fetchHistory を呼び出す
    if ($page.route.id) {
      const path = window.location.pathname;
      const slug = path.split('/').pop()?.toString();
      if (slug) {
        fetchHistory(slug);
      }
    }
  }


  function fetchHistory(channelId: string) {
    console.log("Fetching history for channel:", channelId);
    socket.emit("fetchHistory", {
      RequestSender: {
        userId: getUserInfo.userId,
        sessionId: getSesssionIdStore
      },
      channelId: channelId,
      fetchingPosition: {
        positionMessageId: '',
        includeThisPosition: false,
        fetchDirection: "older",
      },
    });
  }

  let newMessageText = '';

  function sendMessage() {
    console.log("Sending message:", newMessageText);
    if (newMessageText.trim() !== '') {
      socket.emit("sendMessage", {
        channelId: "",
        userId: getUserInfo.userId,
        content: newMessageText,
      });
      newMessageText = '';
    }
  }

  // デバッグ用に chatStore の値をログに出力
  $: {
    console.log($chatStore);
  }
</script>

<div class="flex flex-col h-[calc(100vh-4rem)] mx-auto">
  <div class="flex-grow overflow-y-auto p-4">
    {#if Array.isArray($chatStore.historyData.history)}
      {#each $chatStore.historyData.history as message (message.messageId)}
        {#if message.userId === getUserInfo.userId}
        <div class="flex items-start mb-4">
          <img src="/bot.png" alt="Avatar" class="w-8 h-8 rounded-full mr-2" />
          <div class="flex flex-col">
            <div class="flex items-center">
              <p class="font-bold">{message.userId}</p>
              <p class="text-gray-500 text-sm ml-2">{new Date(message.time).toLocaleTimeString()}</p>
            </div>
            <p class="bg-gray-200 p-2 rounded-lg">{message.content}</p>
          </div>
        </div>
        {/if}
      {/each}
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
    <button on:click={sendMessage} class="p-2 bg-blue-500 text-white rounded-r-lg">Send</button>
  </div>
</div>