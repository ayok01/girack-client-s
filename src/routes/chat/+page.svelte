<script lang="ts">
  import { channelStore } from "$lib/store/channelStore";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import type { IChannel } from "$lib/type/channel";
  import { goto } from "$app/navigation";
  import { socket } from "$lib/socketHandler/socketInit";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";

  let channels: IChannel[] = [];

  let userId = "";
  let sessionId = "";
  let toast: string = "";

  onMount(() => {
    channels = get(channelStore);
    userId = get(userStore).userId;
    sessionId = get(sessionIdStore);
    if (userId === "" || sessionId === "") {
      //cokkieからユーザー情報を取得
      if (sessionId === "") {
        // セッションIDが取得できていない場合はクッキーから取得して利用
        sessionId =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("sessionId="))
            ?.split("=")[1] ?? "";
        //Storeにも保存
        sessionIdStore.set(sessionId);
      }
      if (userId === "") {
        // ユーザーIDが取得できていない場合はクッキーから取得して利用
        userId =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("userId="))
            ?.split("=")[1] ?? "";
        //Storeにも保存
      }
    }
    if (channels.length === 0) {
      socket.emit("fetchChannelList", {
        RequestSender: {
          userId: $userStore.userId,
          sessionId: $sessionIdStore,
        },
      });
    }
  });

  const ClickChannel = (channelId: string) => {
    if ($userStore.channelJoined.includes(channelId)) {
      goto("/chat/" + channelId);
    } else {
      return;
    }
  };

  const onclickJoinChannel = async (channelId: string) => {
    if ($userStore.channelJoined.includes(channelId)) {
      // 既に参加している場合は退出
      // socket.emit("leaveChannel", {
      //   RequestSender: {
      //     userId: userId,
      //     sessionId: sessionId,
      //   },
      //   channelId: channelId,
      // });
    } else {
      // 参加していない場合は参加
      // socket.emit("joinChannel", {
      //   RequestSender: {
      //     userId: userId,
      //     sessionId: sessionId,
      //   },
      //   channelId: channelId,
      // });
    }
    toast = "coming soon...";
    setTimeout(() => {
      toast = "";
    }, 1000);
  };
</script>

<div
  class="flex flex-col {window.innerWidth > 640
    ? 'h-[calc(100svh-4rem)] '
    : 'h-[calc(100svh-6rem)]'}  mx-auto container mx-auto p-4"
>
  <ul class="space-y-4 overflow-y-auto h-full">
    {#each $channelStore as channel}
      <li
        class="p-4 bg-white rounded shadow-md flex items-center justify-between"
      >
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          role="button"
          on:click={() => ClickChannel(channel.channelId)}
          class="flex flex-col content-left cursor-pointer {!$userStore.channelJoined.includes(
            channel.channelId,
          )
            ? 'opacity-50'
            : ''}"
        >
          <div class="flex flex-col content-left">
            <h2 class="text-lg font-semibold">{channel.channelName}</h2>
            <p class="text-gray-600">{channel.description}</p>
          </div>
        </div>
        <button
          class="  {$userStore.channelJoined.includes(channel.channelId)
            ? 'text-red-500'
            : 'text-primary'}"
          on:click={() => onclickJoinChannel(channel.channelId)}
          >{$userStore.channelJoined.includes(channel.channelId)
            ? "退出"
            : "参加"}
        </button>
      </li>
    {/each}
  </ul>
</div>

<div class="toast toast-end">
  {#if toast !== ""}
    <div class="alert alert-info">
      <span>{toast}</span>
    </div>
  {/if}
</div>
