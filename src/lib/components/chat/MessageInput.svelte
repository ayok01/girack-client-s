<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    userStore,
    sessionIdStore,
    userListStore,
  } from "$lib/store/userInfoStore";
  import { IconSend2, IconPaperclip } from "@tabler/icons-svelte";
  import { get } from "svelte/store";
  import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";
  import type { IInputMessage } from "$lib/type/message";
  import type { IUserinfo } from "$lib/type/user";
  import { getAvatarUrl } from "$lib/repository/fileRepository";
  const apiUrl = `${PUBLIC_BACKEND_ADDRESS}`;

  let userList: { [key: string]: IUserinfo } = {};
  userListStore.subscribe((users) => {
    userList = users;
  });
  let message = ""; //メッセージ入力用
  let textarea: HTMLTextAreaElement;
  let selectedFiles: File[] = []; // 選択されたファイルを保持
  export let channelId: string = "dummyChannelName";
  let mentionListVisible = false;
  let mentionQuery = "";
  let filteredUserList: IUserinfo[] = [];
  let selectedUserIndex = -1; // 選択されたユーザーのインデックスを保持

  const dispatch = createEventDispatcher();

  const sendMessage = async () => {
    console.log("sendMessage");
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
      if (event.key === "Enter" && !event.shiftKey) {
        setTimeout(adjustTextareaHeight, 0); // 改行後に高さを調整
        return;
      }
    } else {
      if (
        navigator.platform.toUpperCase().indexOf("MAC") >= 0 &&
        event.keyCode === 229
      ) {
        return;
      }
      if (event.key === "Enter" && event.ctrlKey) {
        return;
      }
      if (event.key === "Enter" && event.shiftKey) {
        setTimeout(adjustTextareaHeight, 0); // 改行後に高さを調整
        return;
      }
      if (event.key === "Enter") {
        if (mentionListVisible && selectedUserIndex >= 0) {
          selectUser(filteredUserList[selectedUserIndex]);
          event.preventDefault();
        } else {
          sendMessage();
          event.preventDefault(); // Enterキーのデフォルト動作を防ぐ
          clickSendAdjustTextareaHeight();
        }
      } else if (event.key === "ArrowDown") {
        if (mentionListVisible) {
          selectedUserIndex = (selectedUserIndex + 1) % filteredUserList.length;
          event.preventDefault();
        }
      } else if (event.key === "ArrowUp") {
        if (mentionListVisible) {
          selectedUserIndex =
            (selectedUserIndex - 1 + filteredUserList.length) %
            filteredUserList.length;
          event.preventDefault();
        }
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById("fileInput")?.click();
  };

  const removeFile = (fileToRemove: File) => {
    selectedFiles = selectedFiles.filter((file) => file !== fileToRemove);
  };

  const handleInput = (event: Event) => {
    const input = event.target as HTMLTextAreaElement;
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = input.value.slice(0, cursorPosition);
    const mentionIndex = textBeforeCursor.lastIndexOf("@");

    if (mentionIndex !== -1) {
      console.log("mentionIndex", mentionIndex);
      mentionQuery = textBeforeCursor.slice(mentionIndex + 1);
      filteredUserList = Object.values(userList).filter((user) =>
        user.userName.toLowerCase().includes(mentionQuery.toLowerCase()),
      );
      console.log("filteredUserList", filteredUserList);
      mentionListVisible = filteredUserList.length > 0;
    } else {
      mentionListVisible = false;
    }
  };

  const selectUser = (user: IUserinfo) => {
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = message.slice(0, cursorPosition);
    const mentionIndex = textBeforeCursor.lastIndexOf("@");

    if (mentionIndex !== -1) {
      message =
        message.slice(0, mentionIndex) +
        `@<${user.userId}>` +
        message.slice(cursorPosition);
      mentionListVisible = false;
    }
  };
</script>

<div class="flex flex-col w-full">
  <div class="file-preview-list mt-2 flex gap-2">
    {#if mentionListVisible}
      <div class="relative flex flex-col gap-2 mb-2 border w-full">
        {#each filteredUserList as user, index}
          <button
            class="p-2 text-left w-full flex items-center gap-2 {index ===
            selectedUserIndex
              ? 'bg-gray-200'
              : ''}"
            on:click={() => selectUser(user)}
            on:keydown={(event) => {
              if (event.key === "Enter") {
                selectUser(user);
              }
            }}
            tabindex="0"
          >
            <img
              src={getAvatarUrl(user.userId)}
              alt={user.userName}
              class="w-6 h-6 rounded-full object-cover"
            />
            {user.userName}
          </button>
        {/each}
      </div>
    {:else}
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
    {/if}
  </div>

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
        on:input={handleInput}
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
