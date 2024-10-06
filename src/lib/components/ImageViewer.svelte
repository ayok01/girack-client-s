<script lang="ts">
  import { onMount } from "svelte";

  export let imageURL: string;
  export let displayImageViewer: {
    value: string | null; //表示するかどうかの変数
    reset: () => void; //表示変数初期化用
  };

  onMount(() => {
    (
      document.getElementById("modal_image_viewer") as HTMLDialogElement
    )?.showModal();
  });
</script>

<dialog id="modal_image_viewer" class="modal">
  <div
    class="md:h-[90%] h-[80%] flex flex-col items-center justify-center overflow-hidden"
  >
    <img
      class="rounded mx-auto"
      style="max-height:100%; max-width:100%; object-fit:contain;"
      alt={imageURL}
      src={imageURL}
    />
    <form method="dialog" class="mt-2 max-h-min w-72 mx-auto">
      <!-- if there is a button in form, it will close the modal -->
      <button
        on:click={displayImageViewer.reset}
        class="btn ml-auto btn-block btn-neutral"
        >閉じる
      </button>
    </form>
  </div>
</dialog>
