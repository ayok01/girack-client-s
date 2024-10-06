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

  let displayImageViewer: {
    value: string | null;
    reset: () => void;
  } = {
    value: null,
    reset: () => (displayImageViewer.value = null),
  };
  let activeImageBlob: { [key: string]: Blob } = {}; //もしPropで渡す場合はこちらを使う
  let activeImageUrlViewing: { [key: string]: string } = {};
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
      const url = loadingImage(id);
      url.then((res) => {
        console.log(res);
        if (res !== null) {
          activeImageUrlViewing[id] = URL.createObjectURL(res);
        } else {
          fileDeleted = true;
        }
      });
    }
  });

  onDestroy(() => {
    socket.off("RESULT::fetchFileInfo", SOCKETfetchFileInfo);
  });

  const handleImageClick = async (id: string) => {
    displayImageViewer.value = id;
  };

  const loadingImage = async (id: string): Promise<Blob | null> => {
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
      return blob;
    } catch (error) {
      console.warn("Error fetching the file:", error);
      return null;
    } finally {
      chatLoadingStore.set(false);
    }
  };
</script>

{#if displayImageViewer.value}
  <ImageViewer
    imageURL={activeImageUrlViewing[displayImageViewer.value]}
    {displayImageViewer}
  />
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
              src={activeImageUrlViewing[id]}
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
