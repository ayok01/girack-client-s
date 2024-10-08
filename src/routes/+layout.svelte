<script lang="ts">
  import "../app.css";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { loadSocket, socket } from "$lib/socketHandler/socketInit";
  import Header from "$lib/components/Header.svelte";
  import {
    userListStore,
    userStore,
    onlineUserListStore,
  } from "$lib/store/userInfoStore";
  import { get } from "svelte/store";
  import { goto } from "$app/navigation";
  import { channelStore } from "$lib/store/channelStore";
  import { getAvatarUrl } from "$lib/repository/fileRepository";
  import { pwaAssetsHead } from "virtual:pwa-assets/head";
  import { pwaInfo } from "virtual:pwa-info";
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipeGesture();
  };

  const handleSwipeGesture = () => {
    if (touchEndX - touchStartX > 50 && touchStartY - touchEndY < 50) {
      // 右スワイプ
      sidebarButtonClick();
    }
  };

  $: {
    const path = $page.url.pathname;
    if (path !== "/auth") {
      localStorage.setItem("currentPath", path);
    }
  }

  const sidebarButtonClick = (event?: MouseEvent) => {
    const sidebarElement = document.getElementById("default-sidebar");
    if (sidebarElement) {
      sidebarElement.classList.remove("-translate-x-full");
      sidebarElement.classList.add("transform-none");
      const sideverDialog = document.getElementById("sideder-dialog");
      if (sideverDialog) {
        sideverDialog.classList.add(
          "bg-gray-900/50",
          "dark:bg-gray-900/80",
          "fixed",
          "inset-0",
          "z-30",
        );
      }
    }
  };

  const sidebarCloseButtonClick = (event: MouseEvent) => {
    const sidebarElement = document.getElementById("default-sidebar");
    if (sidebarElement) {
      sidebarElement.classList.remove("transform-none");
      sidebarElement.classList.add("-translate-x-full");
      const sideverDialog = document.getElementById("sideder-dialog");
      if (sideverDialog) {
        sideverDialog.classList.remove(
          "bg-gray-900/50",
          "dark:bg-gray-900/80",
          "fixed",
          "inset-0",
          "z-30",
        );
      }
    }
  };

  onMount(() => {
    const userInfo = get(userStore);
    if (!userInfo.userId) {
      const pathHeading = $page.url.pathname;
      if (pathHeading !== "/auth" && pathHeading !== "/") {
        goto("/auth?redirect=" + pathHeading);
      } else if (pathHeading !== "/auth" && pathHeading == "/") {
        goto("/auth?redirect=" + "/chat");
      } else {
        goto("/auth");
      }
    }
    if (browser && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js", { type: "module" })
        .then((registration) => {
          console.info("サービスワーカーを登録しました:", registration.scope);
        })
        .catch((error) => {
          console.error("サービスワーカーが登録できませんでした:", error);
        });
    }
    loadSocket();
  });

  let channelName: string = "";

  $: {
    const path = $page.url.pathname;
    const getCannelStore = get(channelStore);
    const slug = path.split("/").pop()?.toString();
    if (slug && path === "/chat/" + slug) {
      const channel = getCannelStore.find(
        (channel) => channel.channelId === slug,
      );
      if (channel) {
        channelName = channel.channelName;
      } else {
        channelName = "";
      }
    } else if (path === "/chat") {
      channelName = "チャンネル一覧";
    } else if (path === "/user/" + $userStore.userId) {
      channelName = "ユーザー情報";
    } else {
      channelName = "";
    }
  }
</script>

<svelte:head>
  {#each pwaAssetsHead.links as link}
    <link {...link} />
  {/each}
  {@html webManifestLink}
</svelte:head>

{#if !$page.route.id?.startsWith("/auth")}
  <div
    class="flex p-2 {!$page.route.id?.startsWith('/auth') ? 'sm:ml-64' : 'p-4'}"
  >
    <button on:click={sidebarCloseButtonClick} id="sideder-dialog" type="button"
    ></button>
    <button
      on:click={sidebarButtonClick}
      type="button"
      class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
    >
      <span class="sr-only">Open sidebar</span>
      <svg
        class="w-6 h-6"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          fill-rule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
        ></path>
      </svg>
    </button>
    <Header {channelName} />
  </div>
{/if}

<div
  class={!$page.route.id?.startsWith("/auth") ? "sm:ml-64" : "p-4"}
  on:touchstart={handleTouchStart}
  on:touchend={handleTouchEnd}
>
  <slot />
</div>

{#if !$page.route.id?.startsWith("/auth")}
  <aside
    id="default-sidebar"
    class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
    aria-label="Sidebar"
    aria-modal="true"
    role="dialog"
  >
    <div class="flex flex-col h-full px-3 py-4 bg-gray-50 dark:bg-gray-800">
      <!-- オンラインユーザー -->
      <div class="avatar-group -space-x-6 rtl:space-x-reverse h-10">
        {#each $onlineUserListStore as onlineUser, index}
          {#if $userListStore[onlineUser] && index < 10}
            <div class="avatar">
              <div class="w-8">
                <img
                  src={getAvatarUrl($userListStore[onlineUser].userId)}
                  alt="Avatar"
                />
              </div>
            </div>
          {/if}
        {/each}
        <div class="avatar placeholder">
          <div class="bg-neutral text-neutral-content w-8">
            <span>{$onlineUserListStore.length}</span>
          </div>
        </div>
      </div>
      <div
        class="border-b border-gray-200 dark:border-gray-700 mt-2 mb-2"
      ></div>
      <span class="ms-3">
        <a href="/chat" on:click={sidebarCloseButtonClick}>チャンネル一覧</a>
      </span>
      <div class="flex-grow overflow-y-auto">
        <ul class="space-y-2 font-medium">
          {#each $channelStore as channel}
            {#if $userStore.channelJoined.includes(channel.channelId)}
              <li>
                <a
                  href={`/chat/${channel.channelId}`}
                  on:click={sidebarCloseButtonClick}
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group {channel.channelId ===
                  $page.url.pathname.split('/').pop()
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : ''}"
                >
                  <span class="flex-1 ms-3 whitespace-nowrap"
                    >{channel.channelName}</span
                  >
                </a>
              </li>
            {/if}
          {/each}
        </ul>
      </div>
      <div class="mt-4">
        <a
          on:click={sidebarCloseButtonClick}
          href={`/user/${$userStore.userId}`}
          class="flex items-center gap-2"
        >
          <img
            src={getAvatarUrl($userStore.userId)}
            alt="Avatar"
            class="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p class="font-bold">{$userStore.userName}</p>
            <p class="text-sm text-gray-500">{$userStore.userId}</p>
          </div>
        </a>
      </div>
    </div>
  </aside>
{/if}
