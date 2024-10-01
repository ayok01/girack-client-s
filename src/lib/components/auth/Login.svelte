<script lang="ts">
  import { socket } from "$lib/socketHandler/socketInit";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { userStore } from "$lib/store/userInfoStore";
  import type { IUserinfo } from "$lib/type/user";
  import { page } from "$app/stores";

  let username = "";
  let password = "";
  let processing = false; //認証処理中かどうか
  let result: "success" | "error" | "" = ""; //認証結果受け取り用

  /**
   * ログインする
   */
  const login = () => {
    console.log("送るデータ->", username, password);
    processing = true;
    socket.emit("authLogin", {
      username: username,
      password: password,
    });
  };

  /**
   * ログイン結果の受け取り
   * @param dat
   */
  const SOCKETauthLogin = (dat: {
    result: string;
    data: {
      UserInfo: IUserinfo;
      sessionId: string;
    } | null;
  }) => {
    console.log("Login :: SOCKETauthLogin : dat->", dat);

    //受け取りデータがnullじゃないなら成功としてStoreへ格納
    if (dat.data !== null) {
      userStore.set(dat.data.UserInfo);

      //クッキー書き込む
      document.cookie =
        "userId=" + dat.data.UserInfo.userId + "; SameSite=strict;";
      document.cookie =
        "sessionId=" + dat.data.sessionId + "; SameSite=strict;";

      // チャンネル情報とチャンネル一覧を取得するイベントを発火
      socket.emit("fetchUserInfo", {
        RequestSender: {
          userId: dat.data.UserInfo.userId,
          sessionId: dat.data.sessionId,
        },
        userId: dat.data.UserInfo.userId,
      });
      socket.emit("fetchChannelList", {
        RequestSender: {
          userId: dat.data.UserInfo.userId,
          sessionId: dat.data.sessionId,
        },
      });
      socket.emit("fetchUserAll", {
        RequestSender: {
          userId: dat.data.UserInfo.userId,
          sessionId: dat.data.sessionId,
        },
        indexPage: "0",
      });

      //リダイレクト情報があるならそのページへ移動、なければトップ
      const redirectTo = $page.url.searchParams.get("redirect");
      if (redirectTo !== null) {
        goto(redirectTo);
      }

      //トップに移動する
      goto("/chat");
    } else {
      //処理中状態を解除
      processing = false;
      //エラーと設定
      result = "error";
    }
  };

  //Socketハンドラ
  socket.on("RESULT::authLogin", SOCKETauthLogin);

  onDestroy(() => {
    socket.off("RESULT::authLogin", SOCKETauthLogin);
  });
</script>

<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <div class="flex flex-col gap-2">
      <p>ユーザー名</p>
      <input
        bind:value={username}
        type="text"
        placeholder="ユーザー名"
        class="input input-bordered w-full"
      />

      <p>パスワード</p>
      <input
        bind:value={password}
        type="password"
        placeholder="password..."
        class="input input-bordered w-full"
      />

      <div class="card-actions justify-end mt-3">
        <button
          on:click={login}
          class="btn btn-block btn-primary"
          disabled={username === "" || password === "" || processing}
        >
          {#if processing}<span class="loading loading-spinner" />{/if}
          ログイン
        </button>
      </div>

      {#if result === "error"}
        <div role="alert" class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>ログインに失敗しました。</span>
        </div>
      {/if}
    </div>
  </div>
</div>
