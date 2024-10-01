<script lang="ts">
  import { socket } from "$lib/socketHandler/socketInit";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
  import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";
  import type { IFile } from "$lib/type/file";
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";

  export let fileId: string[];

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
    console.log("FilePreview :: SOCKETfetchFileInfo : dat->", dat);
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

<p>ここでファイル表示</p>
<div class="flex flex-col gap-2">
  {#each fileId as id}
    <div>
      <img
        class="w-auto rounded"
        style="max-height:100px;"
        alt={"画像 : " + id}
        src={fileDatas[id]?.type.startsWith("image/")
          ? PUBLIC_BACKEND_ADDRESS + "/downloadfile/" + id
          : null}
      />
    </div>
  {/each}
</div>
