<script lang="ts">
  import { socket } from "$lib/socketHandler/socketInit";
  import { goto } from "$app/navigation";
  import Login from "$lib/components/auth/Login.svelte";
  import Register from "$lib/components/auth/Register.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sessionIdStore, userStore } from "$lib/store/userInfoStore";
  import { get } from "svelte/store";
  import { page } from "$app/stores";

  let viewMode: "login" | "register" = "login";
  let cookieAuthData = {
    userId: "",
    sessionId: "",
  };

  /**
   * クッキーによる認証結果の受け取り
   * @param dat
   */
  const SOCKEtauthSession = (dat: { result: string; data: boolean }) => {
    console.log("/auth :: dat->", dat);
    if (dat.data) {
      //自分用のユーザー情報受け取り
      socket.emit("fetchUserInfo", {
        RequestSender: {
          userId: cookieAuthData.userId,
          sessionId: cookieAuthData.sessionId,
        },
        userId: cookieAuthData.userId,
      });
      socket.emit("fetchChannelList", {
        RequestSender: {
          userId: cookieAuthData.userId,
          sessionId: cookieAuthData.sessionId,
        },
      });
      socket.emit("fetchUserAll", {
        RequestSender: {
          userId: cookieAuthData.userId,
          sessionId: cookieAuthData.sessionId,
        },
        indexPage: "0",
      });

      socket.emit("fetchOnlineUsers", {
        RequestSender: {
          userId: cookieAuthData.userId,
          sessionId: cookieAuthData.sessionId,
        },
      });

      //トップへ移動
      //リダイレクト情報があるならそのページへ移動、なければトップ
      const redirectTo = $page.url.searchParams.get("redirect");
      if (redirectTo !== null) {
        goto(redirectTo);
      } else {
        goto("/chat");
      }
    }
  };

  //マウント時、クッキーに認証情報があればそれで処理し始める
  onMount(() => {
    socket.on("RESULT::authSession", SOCKEtauthSession);

    //クッキーからデータを読み込んでみる
    const cookieUserId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    const cookieSessionId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sessionId="))
      ?.split("=")[1];

    //クッキーからの認証情報がundefinedでないなら認証
    if (cookieUserId !== undefined && cookieSessionId !== undefined) {
      //変数に格納
      cookieAuthData.sessionId = cookieSessionId;
      cookieAuthData.userId = cookieUserId;
      //あらかじめ認証情報を自分情報用のStoreへ登録
      userStore.set({ ...get(userStore), userId: cookieAuthData.userId });
      sessionIdStore.set(cookieAuthData.sessionId);

      socket.emit("authSession", {
        userId: cookieUserId,
        sessionId: cookieSessionId,
      });
    }
  });

  onDestroy(() => {
    socket.off("RESULT::authSession", SOCKEtauthSession);
  });
</script>

<div class="md:w-1/2 xl:w-1/3 w-full mx-auto">
  <div class="flex gap-2 mb-2">
    <button
      on:click={() => (viewMode = "login")}
      class="btn grow {viewMode === 'login' ? 'btn-primary' : null}"
      >ログイン</button
    >
    <button
      on:click={() => (viewMode = "register")}
      class="btn grow {viewMode === 'register' ? 'btn-primary' : null}"
      >新規登録</button
    >
  </div>

  {#if viewMode === "login"}
    <Login />
  {:else}
    <Register />
  {/if}
</div>
