<script lang="ts">
  import { get } from "svelte/store";
  import { page } from "$app/stores";
  import { socket } from "$lib/socketHandler/socketInit";
  import {
    userStore,
    sessionIdStore,
    userListStore,
  } from "$lib/store/userInfoStore";
  import { chatStore } from "$lib/store/messageStore";
  import { onMount, tick } from "svelte";
  import { getAvatarUrl } from "$lib/repository/fileRepository";
  import FilePreview from "$lib/components/chat/FilePreview.svelte";
  import MessageInput from "$lib/components/chat/MessageInput.svelte";
  import { IconArrowDownSquareFilled } from "@tabler/icons-svelte";
  import { channelStore } from "$lib/store/channelStore";
  import type { IChannel } from "$lib/type/channel";

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
      isAtBottom =
        chatContainer.scrollTop + chatContainer.clientHeight >=
        chatContainer.scrollHeight;
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
      //会話履歴の最後のメッセージIDを取得
      const currentMessage =
        $chatStore.historyData.history[
          $chatStore.historyData.history.length - 1
        ].messageId;

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
  const sendMessage = async (event: Event) => {
    const message = (event as CustomEvent<string>).detail;
    //console.log("Input :: sendMessage : userId->", channelId, $page);
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
        content: message,
        fileId: [],
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
        content: `<pre class="bg-gray-100 p-2 rounded"><code>${code}</code>`,
      });
      return placeholder;
    });

    // インラインコードを変換
    text = text.replace(inlineCodePattern, (match, code) => {
      const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
      placeholders.push({
        placeholder,
        content: `<code class="bg-gray-100 p-1 rounded">${code}</code>`,
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
</script>

<div
  class="flex flex-col {window.innerWidth > 640
    ? 'h-[calc(100svh-4rem)] '
    : 'h-[calc(100svh-6rem)]'}  mx-auto"
>
  <div
    id="chatContainer"
    class="flex-grow overflow-y-auto p-4"
    on:scroll={handleScroll}
  >
    {#if Array.isArray($chatStore.historyData.history)}
      <div class="flex flex-col-reverse w-full">
        {#each $chatStore.historyData.history as message (message.messageId)}
          {#if message.userId !== "SYSTEM"}
            <div class="flex items-start mb-4 gap-2 w-[calc(100%-64px)]">
              <img
                src={getAvatarUrl(message.userId)}
                alt="Avatar"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div class="flex flex-col w-full">
                <div class="flex items-center">
                  <p class="font-bold">{getUserName(message.userId)}</p>
                  <p class="text-gray-500 text-sm ml-2">
                    {new Date(message.time).toLocaleTimeString()}
                  </p>
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
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <p>メッセージがありません。</p>
    {/if}
  </div>

  <div id="messageInput" class="flex p-2">
    <MessageInput on:send={sendMessage} />
  </div>

  <!-- 最新画面に戻るボタン -->
  <!-- {#if !isAtBottom}
    <button
      class="fixed right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
      style="bottom: {messageInputHeight +
        10 +
        (window.innerWidth < 640 ? 50 : 0)}px;"
      on:click={scrollToLatestMessage}
    >
      <IconArrowDownSquareFilled size={24} />
    </button>
  {/if} -->
</div>
