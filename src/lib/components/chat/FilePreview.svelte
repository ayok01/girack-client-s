<script lang="ts">
  import { socket } from "$lib/socketHandler/socketInit";
  import { IconFile } from "@tabler/icons-svelte";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
  import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";
  import type { IFile } from "$lib/type/file";
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import ImageViewer from "../ImageViewer.svelte";

  export let fileId: string[];

  //モーダル表示用のbool値と初期化用関数セット
  let displayImageViewer = {
    value: false,
    reset: () => (displayImageViewer.value = false),
  };
  //画像ビューワー用URL
  let activeImageUrlViewing = "";

  //ファイル情報格納用
  let fileDatas: {
    [key: string]: IFile;
  } = {};

  $: fileDatas;

  /**
   * ファイル情報の受け取り
   * @param dat
   */
  const SOCKETfetchFileInfo = (dat: {
    result: string;
    data: {
      fileId: string;
      fileInfo: IFile | null;
    };
  }) => {
    //console.log("FilePreview :: SOCKETfetchFileInfo : dat->", dat);
    if (dat.data.fileInfo !== null) {
      //ファイル情報を格納する
      fileDatas[dat.data.fileId] = dat.data.fileInfo;
    }
  };

  onMount(() => {
    socket.on("RESULT::fetchFileInfo", SOCKETfetchFileInfo);

    //ファイルIdごとに情報取得
    for (const id of fileId) {
      socket.emit("fetchFileInfo", {
        RequestSender: {
          userId: get(userStore).userId,
          sessionId: get(sessionIdStore),
        },
        fileId: id,
      });
    }
  });

  onDestroy(() => {
    socket.off("RESULT::fetchFileInfo", SOCKETfetchFileInfo);
  });
</script>

{#if displayImageViewer.value}
  <ImageViewer imageURL={activeImageUrlViewing} {displayImageViewer} />
{/if}
<div class="flex flex-col gap-2">
  {#each fileId as id}
    <div>
      {#if fileDatas[id]?.type.startsWith("image/")}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          on:click={() => {
            activeImageUrlViewing =
              PUBLIC_BACKEND_ADDRESS + "/downloadfile/" + id;
            displayImageViewer.value = true;
          }}
          class="w-auto rounded md:max-h-36 max-h-24 cursor-pointer"
          alt={"画像 : " + id}
          src={fileDatas[id]?.type.startsWith("image/")
            ? PUBLIC_BACKEND_ADDRESS + "/downloadfile/" + id
            : null}
        />
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
