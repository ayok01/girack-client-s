<script lang="ts">
  import { get } from "svelte/store";
  import { page } from "$app/stores";
  import { socket } from "$lib/socketHandler/socketInit";
  import {
    userStore,
    sessionIdStore,
    userListStore,
    onlineUserListStore,
  } from "$lib/store/userInfoStore";
  import { chatStore } from "$lib/store/messageStore";
  import { onMount, tick } from "svelte";
  import { getAvatarUrl } from "$lib/repository/fileRepository";
  import FilePreview from "$lib/components/chat/FilePreview.svelte";
  import MessageInput from "$lib/components/chat/MessageInput.svelte";
  import { channelStore } from "$lib/store/channelStore";
  import type { IChannel } from "$lib/type/channel";
  import type { IMessage, IInputMessage } from "$lib/type/message";
  import { IconTrash } from "@tabler/icons-svelte";
  import { chatLoadingStore } from "$lib/store/chatLoadingStore";
  import { IconStarFilled } from "@tabler/icons-svelte";
  // リアクティブにパスを取得
  $: path = $page.url.pathname;
  $: channelId = path.split("/").pop()?.toString() || "";
  let sendMessageTime: boolean = false;
  let isAtBottom = true;
  let messageInputHeight = 0;

  let channelList: IChannel[] = [];

  channelStore.subscribe((channels) => {
    channelList = channels;
    console.log("channels", channels);
  });

  onMount(() => {
    console.log("Chat page mounted");
    if (channelId) {
      // ページがマウントされたときに最新のチャット履歴を取得
      console.log(
        "Fetching history for channel:",
        channelId,
        "-----===========-------",
      );
      fetchHistory(channelId, "older");
    }

    tick().then(() => {
      setTimeout(() => {
        scroolBottom();
      }, 100);

      const chatContainer = document.getElementById("chatContainer");
      const messageInput = document.getElementById("messageInput");
      if (messageInput) {
        messageInputHeight = messageInput.offsetHeight;
      }
      if (chatContainer) {
        chatContainer.addEventListener("scroll", handleButtomjudge);
      }
      return () => {
        if (chatContainer) {
          chatContainer.removeEventListener("scroll", handleButtomjudge);
        }
      };
    });
  });

  $: {
    if ($page.route.id && channelId) {
      fetchHistory(channelId, "older", "");
      tick().then(() => {
        scroolBottom();
      });
    }
  }

  // チャット履歴を監視
  $: {
    if ($chatStore.historyData.history.length > 0 && sendMessageTime) {
      console.log("発火");
      tick().then(scroolBottom);
    }
    // スクロールの位置が一番下の場合、新しいメッセージが追加されたときにスクロールを一番下に設定
    const chatContainer = document.getElementById("chatContainer");
    if (
      chatContainer &&
      chatContainer.scrollHeight - chatContainer.scrollTop ===
        chatContainer.clientHeight &&
      $chatStore.historyData.history.length > 0
    ) {
      tick().then(scroolBottom);
    }
  }

  // スクロールイベントを監視する関数
  const handleButtomjudge = () => {
    const chatContainer = document.getElementById("chatContainer");

    if (chatContainer) {
      //chatContainer.scrollTop + chatContainer.clientHeight を四捨五入
      const scrollHeight = Math.round(
        chatContainer.scrollTop + chatContainer.clientHeight,
      );
      isAtBottom = scrollHeight >= chatContainer.scrollHeight;
    }
  };

  const fetchHistory = (
    channelId: string,
    direction: string,
    positionMessageId: string = "",
  ) => {
    let sessionId = get(sessionIdStore) || "";
    console.log(
      "Fetching history for channel:",
      channelId,
      direction,
      positionMessageId,
    );
    console.log(
      "これでfetchHistory",
      channelId,
      positionMessageId,
      direction,
      $userStore.userId,
      $sessionIdStore,
    );
    //暫定対応
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
    socket.emit("fetchHistory", {
      RequestSender: {
        userId: $userStore.userId,
        sessionId: sessionId,
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
      // 会話履歴が存在するか確認
      if ($chatStore.historyData.history.length === 0) {
        return;
      }
      //会話履歴の最後のメッセージIDを取得
      const currentMessage =
        $chatStore.historyData.history[
          $chatStore.historyData.history.length - 1
        ].messageId ?? "";

      if ($chatStore.historyData.atTop) {
        return;
      }
      scrollMessageId();
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
  const scrollMessageId = () => {
    const chatContainer = document.getElementById("chatContainer");
    // 一番上のメッセージを取得
    if (chatContainer) {
      const chatContainerTopElement = chatContainer?.firstElementChild
        ?.lastElementChild as HTMLElement;
      if (chatContainerTopElement) {
        console.log("chatContainerTop", chatContainerTopElement);
        const previousScrollHeight = chatContainer.scrollHeight;
        setTimeout(() => {
          const newScrollHeight = chatContainer.scrollHeight;
          const scrollDifference = newScrollHeight - previousScrollHeight;
          chatContainer.scrollTop += scrollDifference;
        }, 100);
      }
    }
  };

  const scroolBottom = async () => {
    // ページ遷移時にスクロール位置を一番下に設定
    //chatLoadingStoreがfalseになるまで待機
    while (get(chatLoadingStore)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await tick();
    console.log("DOM更新完了");
    const chatContainer = document.getElementById("chatContainer");
    console.log("chatContainer", chatContainer);
    if (chatContainer) {
      console.log("scrollIntoView", chatContainer.scrollHeight);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      console.log("scrollIntoView", chatContainer.scrollTop);
    }
  };

  /**
   * メッセージを送信する
   */
  const sendMessage = async (event: CustomEvent<IInputMessage>) => {
    const message = event.detail;
    console.log("Input :: sendMessage : message->", message);
    const messageToSend: IInputMessage = {
      message: message.message,
      fileId: message.fileId,
    };
    console.log(messageToSend);

    console.log(
      "Input :: sendMessage : userId->",
      get(userStore).userId,
      channelId,
    );
    socket.emit("sendMessage", {
      RequestSender: {
        userId: get(userStore).userId,
        sessionId: get(sessionIdStore),
      },
      message: {
        channelId: channelId,
        content: messageToSend.message,
        fileId: messageToSend.fileId || [],
      },
    });
    sendMessageTime = true;
    setTimeout(() => {
      sendMessageTime = false;
    }, 1000);
  };

  const linkify = (text: string) => {
    const getUserList = get(userListStore);
    const urlPattern =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const mentionPattern = /@<(\d+)>/g;
    const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const htmlTagPattern = /<\/?[^>]+(>|$)/g;
    const channelPattern = /#<(\d+)>/g;
    const codeSnippetPattern = /```([^`]+)```/g;
    const inlineCodePattern = /`([^`]+)`/g;

    // スクリプトタグをエスケープ
    text = text.replace(scriptPattern, (match) => {
      return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    });

    // プレースホルダーを使ってリンクとメンションを一時的に置き換え
    const placeholders: { placeholder: string; content: string }[] = [];
    let placeholderIndex = 0;

    // メンションを変換
    text = text.replace(mentionPattern, (match, userId) => {
      const userInfo = getUserList[userId];
      const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
      placeholders.push({
        placeholder,
        content: userInfo
          ? `<span class="w-fit inline-flex items-center glass px-1 rounded-lg">@<img src="${getAvatarUrl(userId)}" alt="${userInfo.userId}" class="w-5 h-5 rounded-full object-cover"  /> ${userInfo.userName}</span>`
          : `<span class="w-fit inline-flex items-center glass px-1 rounded-lg">@Unknown User</span>`,
      });
      return placeholder;
    });

    // リンクを変換
    text = text.replace(urlPattern, (match) => {
      const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
      placeholders.push({
        placeholder,
        content: `<a href="${match}" class="text-blue-700" target="_blank" rel="noopener noreferrer">${match}</a>`,
      });
      return placeholder;
    });

    // チャンネルIDを変換
    text = text.replace(channelPattern, (match, channelId) => {
      const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
      // チャンネルリストからチャンネル名を取得
      const channel = channelList.find(
        (channel) => channel.channelId === channelId,
      );
      const channelName = channel ? channel.channelName : "Unknown Channel";
      placeholders.push({
        placeholder,
        content: `<a href="/chat/${channelId}" class="w-fit inline-flex items-center glass px-1 rounded-lg" rel="noopener noreferrer">#${channelName}</a>`,
      });
      return placeholder;
    });

    // コードスニペットを変換
    text = text.replace(codeSnippetPattern, (match, code) => {
      const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
      placeholders.push({
        placeholder,
        content: `<pre class="overflow-x-auto bg-gray-100 p-2 rounded"><code>${code}</code>`,
      });
      return placeholder;
    });

    // インラインコードを変換
    text = text.replace(inlineCodePattern, (match, code) => {
      const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
      placeholders.push({
        placeholder,
        content: `<code class=" bg-gray-100 p-1 rounded">${code}</code>`,
      });
      return placeholder;
    });

    // その他のHTMLタグをエスケープ
    text = text.replace(htmlTagPattern, (match) => {
      return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    });

    // プレースホルダーを元に戻す
    placeholders.forEach(({ placeholder, content }) => {
      text = text.replace(placeholder, content);
    });

    return text;
  };

  const scrollToLatestMessage = () => {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  interface IDateBefore {
    judge: boolean;
    value: Date;
  }
  /**
   * 前の投稿と比較して日付が変わったかどうかを判定
   * @return {judge: boolean, value:Date } 日付が変わった場合はtrue
   */
  const isDateChanged = (currentMessage: IMessage): IDateBefore => {
    //Storeから配列の順番を取得
    const index = $chatStore.historyData.history.findIndex(
      (message) => message.messageId === currentMessage.messageId,
    );
    // 取得した順番の一つ前のメッセージを取得
    const previousMessage = $chatStore.historyData.history[index - 1];
    // 一つ前のメッセージが存在しない場合はfalseを返す
    if (!previousMessage) {
      return {
        judge: false,
        value: new Date(),
      };
    }
    // 一つ前のメッセージの日付と比較
    const previousDate = new Date(previousMessage.time);
    const currentDate = new Date(currentMessage.time);
    const judge =
      previousDate.getFullYear() !== currentDate.getFullYear() ||
      previousDate.getMonth() !== currentDate.getMonth() ||
      previousDate.getDate() !== currentDate.getDate();
    console.log(
      "previousDate",
      previousDate.toDateString(),
      "currentDate",
      currentDate.toDateString(),
      "judge",
      judge,
    );

    return {
      judge: judge,
      value: previousDate,
    };
  };

  /**
   * メッセージを削除する
   */
  const deleteMessage = (message: IMessage) => {
    socket.emit("deleteMessage", {
      RequestSender: {
        userId: $userStore.userId,
        sessionId: $sessionIdStore,
      },
      channelId: message.channelId,
      messageId: message.messageId,
    });
  };

  // リアクションの総数を計算する関数
  function getTotalReactions(reaction: IMessage["reaction"]): number {
    let total = 0;
    for (const emoji in reaction) {
      if (reaction.hasOwnProperty(emoji)) {
        for (const user in reaction[emoji]) {
          if (reaction[emoji].hasOwnProperty(user)) {
            total += reaction[emoji][user];
          }
        }
      }
    }
    return total;
  }

  // リアクションをつけたユーザーのリストを取得する関数
  function getReactionUsers(reaction: IMessage["reaction"]): string {
    const users = new Set<string>();
    for (const emoji in reaction) {
      if (reaction.hasOwnProperty(emoji)) {
        for (const user in reaction[emoji]) {
          if (reaction[emoji].hasOwnProperty(user)) {
            const userName = $userListStore[user]?.userName || "Unknown User";
            users.add(userName);
          }
        }
      }
    }
    return Array.from(users).join("\n");
  }
</script>

<div class="flex flex-col h-[calc(100svh-56px)] mx-auto">
  <div
    id="chatContainer"
    class="flex-grow overflow-y-auto p-4"
    on:scroll={handleScroll}
  >
    {#if Array.isArray($chatStore.historyData.history)}
      <div class="flex flex-col-reverse w-full">
        {#each $chatStore.historyData.history as message (message.messageId)}
          {#if message.userId !== "SYSTEM"}
            <div>
              <div
                class=" message-container flex items-start mb-4 gap-2 w-[calc(100%-32px)]"
              >
                <div
                  class="avatar {$onlineUserListStore.includes(message.userId)
                    ? 'online'
                    : 'offline'}"
                >
                  <div class="w-8 rounded-full">
                    <img src={getAvatarUrl(message.userId)} alt="Avatar" />
                  </div>
                </div>
                <div class="flex flex-col w-full">
                  <div class="flex items-center">
                    <p class="font-bold">{getUserName(message.userId)}</p>
                    <p class="text-gray-500 text-sm ml-2">
                      {new Date(message.time).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {#if message.userId === $userStore.userId}
                      <button
                        class="delete-button ml-auto text-gray-500 hidden hover:text-red-500"
                        on:click={() => deleteMessage(message)}
                      >
                        <IconTrash size={20} />
                      </button>
                    {/if}
                  </div>
                  <div class=" p-2 rounded-lg break-words whitespace-pre-wrap">
                    {@html linkify(message.content)}
                  </div>

                  {#if message.linkData && Object.keys(message.linkData).length > 0}
                    <div class="mt-2 p-2 border rounded-lg">
                      {#each Object.values(message.linkData) as link}
                        {#if link.contentType === "text/html"}
                          <div class="md:flex flex-row">
                            <div
                              class="md:ml-4 md:flex-grow md:min-w-0 md:basis-1/2"
                            >
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-blue-700 md:flex-shrink-0"
                              >
                                <img
                                  src={link.favicon}
                                  alt="Favicon"
                                  class="inline w-4 h-4 mr-1"
                                />
                                {link.title}
                              </a>
                              <div class="md:ml-4 md:flex-grow md:min-w-0">
                                <p class="break-words">{link.description}</p>
                              </div>
                            </div>
                            {#if link.images && link.images.length > 0}
                              <div
                                class="h-30 sm:h-20 md:h-40 md:w-fit overflow-hidden md:ml-4"
                              >
                                <img
                                  src={link.images[0].url}
                                  alt={`Preview image for ${link.title}`}
                                  class="mt-2 w-full h-full object-cover rounded-lg"
                                />
                              </div>
                            {/if}
                          </div>
                        {/if}
                        {#if link.contentType === "image"}
                          <div
                            class="h-30 sm:h-20 md:h-40 md:w-40 overflow-hidden"
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={link.url}
                                alt={`Preview image for`}
                                class="mt-2 w-full h-full object-cover rounded-lg"
                              />
                            </a>
                          </div>
                        {/if}
                        {#if link.contentType === "video"}
                          <div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <video
                                controls
                                class="mt-2 w-full h-auto rounded-lg"
                              >
                                <source src={link.url} type={link.mediaType} />
                                <track
                                  kind="captions"
                                  src="path/to/captions.vtt"
                                  srclang="jp"
                                  label="Japanese captions"
                                  default
                                />
                              </video>
                            </a>
                          </div>
                        {/if}
                      {/each}
                    </div>
                  {/if}

                  <!-- ファイルデータ表示 -->
                  {#if message.fileId.length !== 0}
                    <FilePreview fileId={message.fileId} />
                  {/if}
                  <div>
                    <!-- リアクションがある場合 -->
                    {#if message.reaction && Object.keys(message.reaction).length > 0}
                      <div
                        class="tooltip md:tooltip-right before:w-[5rem] before:content-[attr(data-tip)]"
                        data-tip={getReactionUsers(message.reaction)}
                      >
                        <div
                          class="p-1 bg-base-200 text-sm rounded-full flex gap-1"
                        >
                          <IconStarFilled size={20} />
                          <div>{getTotalReactions(message.reaction)}</div>
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
              {#if isDateChanged(message).judge}
                <div class="flex items-center justify-center my-4">
                  <hr class="border-t border-gray-300 w-full" />
                  <span class="px-2 text-gray-500 text-sm">
                    {new Date(isDateChanged(message).value).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      },
                    )}
                  </span>
                  <hr class="border-t border-gray-300 w-full" />
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <p>メッセージがありません。</p>
    {/if}
  </div>

  <div id="messageInput" class="flex p-2">
    <MessageInput
      on:send={sendMessage}
      {channelId}
      {isAtBottom}
      on:scrollToBottom={scrollToLatestMessage}
    />
  </div>
</div>

<style>
  .message-container:hover .delete-button,
  .message-container:focus-within .delete-button {
    display: block;
  }
</style>
