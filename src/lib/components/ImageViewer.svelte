<script lang="ts">
  import { onMount } from "svelte";

  export let imageURL: string;
  export let displayImageViewer: {
    value: boolean; //表示するかどうかの変数
    reset: () => void; //表示変数初期化用
  };

  onMount(() => {
    (
      document.getElementById("modal_image_viewer") as HTMLDialogElement
    )?.showModal();
  });
</script>

<dialog id="modal_image_viewer" class="modal">
  <img
    class="w-auto rounded mt-auto"
    style="max-height:90%; max-width:90vw;"
    alt={imageURL}
    src={imageURL}
  />
  <form method="dialog" class="max-h-min w-72 mx-auto">
    <!-- if there is a button in form, it will close the modal -->
    <button
      on:click={displayImageViewer.reset}
      class="btn ml-auto btn-block btn-neutral"
      >閉じる
    </button>
  </form>
</dialog>
