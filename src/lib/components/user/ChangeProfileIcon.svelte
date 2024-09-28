<script lang="ts">
  import { sessionIdStore, userStore } from "$lib/store/userInfoStore";
  import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";

  //prop
  export let displayChangeProfileIcon: {
    value: boolean; //表示するかどうかの変数
    reset: () => void; //表示変数初期化用
  };

  //アイコン用ファイル入力
  let fileIcon: File | null;
  //処理中状態
  let processing: boolean = false;
  //結果
  let uploadResult: "success" | "error" | "" = "";

  /**
   * アイコンを更新する
   */
  const uploadIcon = async () => {
    const formData = new FormData();

    if (fileIcon === null) return;

    const metadata = {
      userId: $userStore.userId,
      sessionId: $sessionIdStore,
    };

    //画像ファイルを格納
    formData.append("file", fileIcon);
    // JSONデータを文字列に変換して追加
    formData.append("metadata", JSON.stringify(metadata));

    //処理中と設定
    processing = true;

    //画像アップロード(結果はHTTPリスポンス)
    await fetch(PUBLIC_BACKEND_ADDRESS + "/uploadProfileIcon", {
      method: "POST",
      body: formData,
    })
      .finally(() => {
        console.log("ChangeProfileIcon :: uploadIcon : 成功!");
        //アップロード状態を解除
        processing = false;
        uploadResult = "success";
      })
      .catch((err: Error) => {
        console.log(
          "ChangeProfileIcon :: uploadIcon : アップロードエラー->",
          err,
        );
        uploadResult = "error";

        return;
      });
  };

  //モーダル表示変数が有効ならモーダル表示
  $: if (displayChangeProfileIcon.value) {
    (document.getElementById("my_modal_1") as HTMLDialogElement)?.showModal();
  }

  $: if (fileIcon) {
    console.log("ChangeProfileIcon :: watch(fileIcon) : fileIcon->", fileIcon);
  }

  const handleFileInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      fileIcon = target.files[0];
    }
  };
</script>

<p>{displayChangeProfileIcon.value}</p>
<dialog
  id="my_modal_1"
  class="modal"
  on:close={() => displayChangeProfileIcon.reset()}
>
  <div class="modal-box">
    <h3 class="text-lg font-bold mb-2">プロフィール変更</h3>

    {#if uploadResult !== "success"}
      <input
        on:input={handleFileInput}
        accept="image/png, image/jpeg, image/gif"
        type="file"
        class="file-input file-input-bordered w-full my-2"
      />

      {#if uploadResult === "error"}
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
          <span>アイコンを変更できませんでした。</span>
        </div>
      {/if}
    {:else if uploadResult === "success"}
      <div role="alert" class="alert alert-success">
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>アイコンを変更しました!</span>
      </div>
    {/if}

    <div class="modal-action">
      <button
        on:click={uploadIcon}
        disabled={processing || uploadResult === "success"}
        class="btn"
      >
        {#if processing}<span class="loading loading-spinner" />{/if}
        変更する
      </button>
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">閉じる</button>
      </form>
    </div>
  </div>
</dialog>
