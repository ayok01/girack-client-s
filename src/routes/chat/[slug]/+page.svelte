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
  import MessageInput from "$lib/components/chat/MessageInput.svelte";
  import { IconArrowDownSquareFilled } from "@tabler/icons-svelte";

  // リアクティブにパスを取得
  $: path = $page.url.pathname;
  $: channelId = path.split("/").pop()?.toString() || "";
  let sendMessageTime: boolean = false;
  let isAtBottom = true;
  let messageInputHeight = 0;

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
    let sesstionId = get(sessionIdStore) || "";
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
    if (sesstionId === "") {
      // セッションIDが取得できていない場合はクッキーから取得して利用
      sesstionId =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("sessionId="))
          ?.split("=")[1] ?? "";
      //Storeにも保存
      sessionIdStore.set(sesstionId);
    }
    socket.emit("fetchHistory", {
      RequestSender: {
        userId: $userStore.userId,
        sessionId: sesstionId,
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

  // リンクを検出して変換する関数
  const linkify = (text: string) => {
    const getUserList = get(userListStore);
    const urlPattern =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const mentionPattern = /@<(\d+)>/g;
    const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const htmlTagPattern = /<\/?[^>]+(>|$)/g;

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
        content: `<span class="w-fit inline-flex items-center glass px-1 rounded-lg">@<img src="${getAvatarUrl(userId)}" alt="${userInfo.userId}" class="w-5 h-5 rounded-full object-cover"  /> ${userInfo.userName}</span>`,
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
  {#if !isAtBottom}
    <button
      class="fixed right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
      style="bottom: {messageInputHeight +
        10 +
        (window.innerWidth < 640 ? 50 : 0)}px;"
      on:click={scrollToLatestMessage}
    >
      <IconArrowDownSquareFilled size={24} />
    </button>
  {/if}
</div>
