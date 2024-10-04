<script lang="ts">
  import { userStore } from "$lib/store/userInfoStore";
  import { channelStore } from "$lib/store/channelStore";
  import ChangeProfileIcon from "$lib/components/user/ChangeProfileIcon.svelte";
  import { getAvatarUrl } from "$lib/repository/fileRepository";
  import { onDestroy } from "svelte";

  //モーダル表示用のbool値と初期化用関数セット
  let displayChangeProfileIcon = {
    value: false,
    reset: () => (displayChangeProfileIcon.value = false),
  };

  // 入っているチャンネル名
  let joinChannelListName: string[] = [];
  const unsubscribe = channelStore.subscribe((channels) => {
    joinChannelListName = channels
      .map((c) => c.channelName)
      .filter((value, index, self) => self.indexOf(value) === index);
  });

  onDestroy(() => {
    unsubscribe();
  });

  function updateUserName(newName: string) {
    userStore.update((user) => ({ ...user, userName: newName }));
  }

  // クッキーを削除する関数
  const deleteCookies = () => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/user; domain=${location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${location.hostname}`;
    }
  };
  // ローカルストレージを削除する関数
  const deleteLocalStorage = () => {
    localStorage.removeItem("currentPath");
  };

  // クッキーとローカルストレージが削除されたことを確認する関数
  const isStorageCleared = () => {
    const cookiesCleared =
      !document.cookie.includes("userId") &&
      !document.cookie.includes("sessionId") &&
      !document.cookie.includes("session");
    const localStorageCleared = localStorage.getItem("currentPath") === null;
    return cookiesCleared && localStorageCleared;
  };

  // ログアウト処理
  const logout = async () => {
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

    // クッキーとローカルストレージを削除
    deleteCookies();
    await deleteLocalStorage();
    await setTimeout(() => {
      // 削除が確認できたらリロード
      if (isStorageCleared()) {
        location.reload();
      } else {
        console.error("クッキーまたはローカルストレージの削除に失敗しました。");
      }
    }, 1000);
  };
</script>

<ChangeProfileIcon {displayChangeProfileIcon} />
<div
  class="flex flex-col items-center justify-centerf p-4 overflow-y-auto
  h-[calc(100svh-56px)] mx-auto"
>
  <div class="rounded-lg p-6 w-full max-w-md">
    <div class="flex flex-col items-center mb-4">
      <img
        src={getAvatarUrl($userStore.userId)}
        alt="アバター"
        class="w-20 h-20 rounded-full mb-4 rounded-full object-cover"
      />
    </div>
    <div class="mb-4">
      <p>
        <span class="font-semibold">名前:</span>
        {$userStore.userName}
      </p>
      <p>
        <span class="font-semibold">ロール:</span>
        {$userStore.role.join(", ")}
      </p>
      <p>
        <span class="font-semibold">ユーザーID:</span>
        {$userStore.userId}
      </p>
      <p>
        <span class="font-semibold">BANされたかどうか:</span>
        {$userStore.banned ? "はい" : "いいえ"}
      </p>
      <div>
        <span class="font-semibold">参加しているチャンネル:</span>
        <div class="flex flex-wrap gap-2">
          {#each joinChannelListName as channel}
            <div class="rounded-btn glass p-1">
              #{channel}
            </div>
          {/each}
        </div>
      </div>
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
