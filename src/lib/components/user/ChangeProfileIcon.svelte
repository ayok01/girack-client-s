<script lang="ts">
    //prop
    export let displayChangeProfileIcon: {
        value: boolean, //表示するかどうかの変数
        reset: () => void //表示変数初期化用
    };

    //アイコン用ファイル入力
    let fileIcon: File | null;

    //モーダル表示変数が有効ならモーダル表示
    $: if (displayChangeProfileIcon.value) {
        document.getElementById("my_modal_1")?.showModal();
    }

    $: if (fileIcon) {
        console.log("ChangeProfileIcon :: watch(fileIcon) : fileIcon->", fileIcon);
    }
</script>

<p>{ displayChangeProfileIcon.value }</p>
<dialog id="my_modal_1" class="modal" on:close={() => displayChangeProfileIcon.reset()}>
    <div class="modal-box">
        <h3 class="text-lg font-bold">プロフィール変更</h3>
        <input
            on:input={event => fileIcon = event.target?.files[0]}
            accept="image/png, image/jpeg, image/gif"
            type="file"
            class="file-input file-input-bordered w-full my-2"
        />
        <div class="modal-action">
            <button class="btn">変更する</button>
            <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <button class="btn">Close</button>
            </form>
        </div>
    </div>
</dialog>
