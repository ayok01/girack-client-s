<script lang="ts">
  import { userStore } from "$lib/store/userInfoStore";
  import ChangeProfileIcon from "$lib/components/user/ChangeProfileIcon.svelte";
  import { getAvatarUrl } from "$lib/repository/fileRepository";

  //モーダル表示用のbool値と初期化用関数セット
  let displayChangeProfileIcon = {
    value: false,
    reset: () => (displayChangeProfileIcon.value = false),
  };

  function updateUserName(newName: string) {
    userStore.update((user) => ({ ...user, userName: newName }));
  }

  // ログアウト処理
  const logout = () => {
    // セッション情報を削除
    userStore.update((user) => ({
      ...user,
      userId: "",
      sessionId: "",
      userName: "",
      role: [],
      banned: false,
      channelJoined: [],
    }));
    // クッキー情報を削除
    document.cookie = "userId=; max-age=0";
    document.cookie = "sessionId=; max-age=0";
    // ローカルストレージ情報を削除
    localStorage.removeItem("currentPath");
    // リロード
    location.reload();
  };
</script>

<ChangeProfileIcon {displayChangeProfileIcon} />
<div
  class="flex flex-col items-center justify-centerf p-4
  {window.innerWidth > 640
    ? 'h-[calc(100svh-4rem)] '
    : 'h-[calc(100svh-6rem)]'}  mx-auto"
>
  <div class="rounded-lg p-6 w-full max-w-md">
    <h1 class="text-2xl font-bold mb-4">ユーザー情報</h1>
    <div class="flex flex-col items-center mb-4">
      <img
        src={getAvatarUrl($userStore.userId)}
        alt="アバター"
        class="w-24 h-24 rounded-full mb-4 rounded-full object-cover"
      />
    </div>
    <div class="mb-4">
      <p class="text-gray-700">
        <span class="font-semibold">名前:</span>
        {$userStore.userName}
      </p>
      <p class="text-gray-700">
        <span class="font-semibold">ロール:</span>
        {$userStore.role.join(", ")}
      </p>
      <p class="text-gray-700">
        <span class="font-semibold">ユーザーID:</span>
        {$userStore.userId}
      </p>
      <p class="text-gray-700">
        <span class="font-semibold">BANされたかどうか:</span>
        {$userStore.banned ? "はい" : "いいえ"}
      </p>
      <p class="text-gray-700">
        <span class="font-semibold">参加しているチャンネル:</span>
        {$userStore.channelJoined.join(", ")}
      </p>
    </div>

    <div class="mb-4">
      <input
        type="text"
        bind:value={$userStore.userName}
        placeholder="名前を更新"
        class="w-full p-2 border border-gray-300 rounded"
      />
      <button
        on:click={() => updateUserName($userStore.userName)}
        class="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        名前を更新(まだ未実装)
      </button>
    </div>

    <div class="mb-4">
      <button
        on:click={() => (displayChangeProfileIcon.value = true)}
        class="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        アイコンを変える
      </button>
    </div>

    <div>
      <button
        on:click={logout}
        class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        ログアウト
      </button>
    </div>
  </div>
</div>
