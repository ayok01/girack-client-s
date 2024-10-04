<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
  import { IconSend2, IconPaperclip } from "@tabler/icons-svelte";
  import { get } from "svelte/store";
  import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";
  import type { IInputMessage } from "$lib/type/message";
  import { text } from "@sveltejs/kit";
  const apiUrl = `${PUBLIC_BACKEND_ADDRESS}`;

  let message = ""; //メッセージ入力用
  let textarea: HTMLTextAreaElement;
  let selectedFiles: File[] = []; // 選択されたファイルを保持
  export let channelId: string = "dummyChannelName";

  const dispatch = createEventDispatcher();

  const sendMessage = async () => {
    console.log("sendMessage");
    // メッセージが空文字または改行だけの場合は無視
    if (message.trim() === "" && selectedFiles.length === 0) {
      return;
    }

    let fileIds: string[] | null = null;
    if (selectedFiles.length > 0) {
      const uploadedFileIds = await Promise.all(
        selectedFiles.map((file) => uploadFile(file)),
      );
      fileIds = uploadedFileIds.filter((id): id is string => id !== null); // nullを除外
    }

    const messageToSend: IInputMessage = {
      message: message,
      fileId: fileIds,
    };
    dispatch("send", messageToSend);
    message = ""; // メッセージをリセット
    selectedFiles = []; // ファイルをリセット
    clickSendAdjustTextareaHeight(); // メッセージ送信後に高さをリセット
  };

  const uploadFile = (file: File): Promise<string | null> => {
    const user = get(userStore);
    const sessionId = get(sessionIdStore);
    console.log("uploadFile -> user", user.userId, sessionId);
    return new Promise((resolve, reject) => {
      const metadataForForm = {
        RequestSender: {
          userId: user.userId,
          sessionId: sessionId,
        },
        directory: `C${channelId}_${user.userId}`,
      };

      const formData = new FormData();
      formData.append("metadata", JSON.stringify(metadataForForm));
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          console.log(
            `Upload progress: ${Math.round((event.loaded / event.total) * 100)}%`,
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          if (result.data !== undefined) {
            resolve(result.data);
          } else {
            reject("Failed to get file ID");
          }
        } else {
          reject(xhr.statusText);
        }
      });

      xhr.withCredentials = true;
      xhr.open("POST", `${apiUrl}/uploadfile`);
      xhr.send(formData);
    });
  };

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFiles = [...selectedFiles, ...Array.from(input.files)];
    }
  };

  const adjustTextareaHeight = () => {
    console.log("adjustTextareaHeight", textarea);
    if (textarea) {
      textarea.style.height = "42px"; // 一旦高さをリセット
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"; // 最大200pxまで広げる
    }
  };

  const clickSendAdjustTextareaHeight = () => {
    if (textarea) {
      textarea.style.height = "42px"; // 高さをリセット
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // スマホの場合はEnterキーで改行
      if (event.key === "Enter" && !event.shiftKey) {
        setTimeout(adjustTextareaHeight, 0); // 改行後に高さを調整
        return;
      }
    } else {
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
        clickSendAdjustTextareaHeight();
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById("fileInput")?.click();
  };

  const removeFile = (fileToRemove: File) => {
    selectedFiles = selectedFiles.filter((file) => file !== fileToRemove);
  };
</script>

<div class="flex flex-col w-full">
  <!-- ファイルプレビューリスト -->
  {#if selectedFiles.length > 0}
    <div class="file-preview-list mt-2 flex gap-2">
      {#each selectedFiles as file}
        <div class="file-preview-item relative flex items-center mb-2">
          {#if file.type.startsWith("image/")}
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              class="file-preview-image max-w-12 max-h-12 mr-2"
            />
            <button
              on:click={() => removeFile(file)}
              class="remove-icon absolute top-0 right-0 m-1 text-red-500"
              aria-label="削除"
            >
              ✖️
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <div class="flex w-full mt-2">
    <button
      on:click={triggerFileInput}
      class="mr-2 p-2 text-white rounded bg-neutral"
    >
      <IconPaperclip size={20} />
      <input
        type="file"
        id="fileInput"
        on:change={handleFileChange}
        class="hidden"
        multiple
      />
    </button>
    <div class="flex grow gap-2 w-full">
      <textarea
        bind:value={message}
        placeholder="メッセージを入力"
        class="p-2 border rounded-lg resize-none h-10 w-full text-sm"
        on:keydown={handleKeyDown}
        bind:this={textarea}
        on:input={adjustTextareaHeight}
      />
      <button
        on:click={sendMessage}
        class="p-2 text-white rounded-lg bg-neutral {message.trim() === '' &&
        selectedFiles.length === 0 &&
        $userStore.channelJoined.includes(channelId)
          ? 'opacity-50'
          : ''}"
        disabled={message.trim() === "" &&
          selectedFiles.length === 0 &&
          $userStore.channelJoined.includes(channelId)}
      >
        <IconSend2 size={20} />
      </button>
    </div>
  </div>
</div>

<style>
  .file-preview-list {
    margin-top: 10px;
  }
  .file-preview-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .file-preview-image {
    max-width: 50px;
    max-height: 50px;
    margin-right: 10px;
  }
  .remove-icon {
    position: absolute;
    top: 0;
    right: 0;
    margin: 5px;
    cursor: pointer;
    background: white;
    border-radius: 50%;
    padding: 2px;
  }
</style>
