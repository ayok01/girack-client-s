<script lang="ts">
    export let displayChangeProfileIcon: {
        value: boolean,
        reset: () => void
    };

    //モーダル表示変数が有効ならモーダル表示
    $: if (displayChangeProfileIcon.value) {
        document.getElementById("my_modal_1")?.showModal();
    }
</script>

<p>{ displayChangeProfileIcon.value }</p>
<dialog id="my_modal_1" class="modal" on:close={() => displayChangeProfileIcon.reset()}>
    <div class="modal-box">
        <h3 class="text-lg font-bold">Hello!</h3>
        <p class="py-4">Press ESC key or click the button below to close</p>
        <div class="modal-action">
            <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn">Close</button>
            </form>
        </div>
    </div>
</dialog>
