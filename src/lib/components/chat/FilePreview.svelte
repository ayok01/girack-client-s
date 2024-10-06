<script lang="ts">
  import { socket } from "$lib/socketHandler/socketInit";
  import { IconFile } from "@tabler/icons-svelte";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
  import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";
  import type { IFile } from "$lib/type/file";
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import ImageViewer from "../ImageViewer.svelte";
  import { chatLoadingStore } from "$lib/store/chatLoadingStore";

  export let fileId: string[];

  let displayImageViewer = {
    value: false,
    reset: () => (displayImageViewer.value = false),
  };
  let activeImageUrlViewing = "";
  let fileDatas: { [key: string]: IFile } = {};
  let fileDeleted: boolean = false;
  $: fileDatas;

  const SOCKETfetchFileInfo = (dat: {
    result: string;
    data: { fileId: string; fileInfo: IFile | null };
  }) => {
    if (dat.data.fileInfo !== null) {
      fileDatas[dat.data.fileId] = dat.data.fileInfo;
    }
  };

  onMount(() => {
    socket.on("RESULT::fetchFileInfo", SOCKETfetchFileInfo);
    for (const id of fileId) {
      socket.emit("fetchFileInfo", {
        RequestSender: {
          userId: get(userStore).userId,
          sessionId: get(sessionIdStore),
        },
        fileId: id,
      });
    }

    for (const id of fileId) {
      loadingImage(id);
    }
  });

  onDestroy(() => {
    socket.off("RESULT::fetchFileInfo", SOCKETfetchFileInfo);
  });

  async function handleImageClick(id: string) {
    const userId = get(userStore).userId;
    const sessionId = get(sessionIdStore);
    const url = `${PUBLIC_BACKEND_ADDRESS}/downloadfile/${id}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-user-id": userId,
          "x-session-id": sessionId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();
      activeImageUrlViewing = URL.createObjectURL(blob);
      displayImageViewer.value = true;
    } catch (error) {
      console.warn("Error fetching the file:", error);
    }
  }

  async function loadingImage(id: string) {
    chatLoadingStore.set(true);
    const userId = get(userStore).userId;
    const sessionId = get(sessionIdStore);
    const url = `${PUBLIC_BACKEND_ADDRESS}/downloadfile/${id}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-user-id": userId,
          "x-session-id": sessionId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();
      activeImageUrlViewing = URL.createObjectURL(blob);
    } catch (error) {
      console.warn("Error fetching the file:", error);
      fileDeleted = true;
    }
    chatLoadingStore.set(false);
  }
</script>

{#if displayImageViewer.value}
  <ImageViewer imageURL={activeImageUrlViewing} {displayImageViewer} />
{/if}
<div class="flex flex-col gap-2">
  {#each fileId as id}
    <div>
      {#if fileDatas[id]?.type.startsWith("image/")}
        {#if fileDatas[id]?.id}
          <button
            on:click={() => handleImageClick(id)}
            class="w-auto rounded md:max-h-36 max-h-24 cursor-pointer"
            aria-label={"画像 : " + id}
          >
            <img
              class="w-auto rounded md:max-h-36 max-h-24"
              alt={"画像 : " + id}
              src={activeImageUrlViewing}
            />
          </button>
        {/if}
      {:else if fileDeleted}
        <div
          class="card bg-base-200 py-2 px-3 flex gap-2 flex-row flex-wrap items-center"
        >
          <IconFile />
          <span>ファイルが削除されています</span>
        </div>
      {:else}
        <div
          class="card bg-base-200 py-2 px-3 flex gap-2 flex-row flex-wrap items-center"
        >
          <IconFile />
          <span>{fileDatas[id]?.name || "loading..."}</span>
        </div>
      {/if}
    </div>
  {/each}
</div>
