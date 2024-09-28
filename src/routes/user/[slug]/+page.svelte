<script lang="ts">
  import { userStore } from "$lib/store/userInfoStore";
  import ChangeProfileIcon from "$lib/components/user/ChangeProfileIcon.svelte";

  //モーダル表示用のbool値と初期化用関数セット
  let displayChangeProfileIcon = {
    value: false,
    reset: () => (displayChangeProfileIcon.value = false),
  };

  function updateUserName(newName: string) {
    userStore.update((user) => ({ ...user, userName: newName }));
  }
</script>

<ChangeProfileIcon {displayChangeProfileIcon} />
<div>
  <h1>ユーザー情報</h1>
  <p>名前: {$userStore.userName}</p>
  <p>ロール: {$userStore.role.join(", ")}</p>
  <p>ユーザーID: {$userStore.userId}</p>
  <p>BANされたかどうか: {$userStore.banned ? "はい" : "いいえ"}</p>
  <p>参加しているチャンネル: {$userStore.channelJoined.join(", ")}</p>

  <input
    type="text"
    bind:value={$userStore.userName}
    placeholder="名前を更新"
  />
  <button on:click={() => updateUserName($userStore.userName)}
    >名前を更新</button
  >

  <button on:click={() => (displayChangeProfileIcon.value = true)} class="btn"
    >アイコンを変える</button
  >
</div>
