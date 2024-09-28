<script lang="ts">
    import Login from "$lib/components/auth/Login.svelte";
    import Register from "$lib/components/auth/Register.svelte";

    let viewMode: "login" | "register" = "login";
</script>

<div class="md:w-1/2 xl:w-1/3 w-full mx-auto">
    <div class="flex gap-2 mb-2">
        <button
            on:click={()=>viewMode="login"}
            class="btn grow {viewMode==="login" ? "btn-primary" : null}"
        >ログイン</button>
        <button
            on:click={()=>viewMode="register"}
            class="btn grow {viewMode==="register" ? "btn-primary" : null}"
        >新規登録</button>
    </div>

    {#if viewMode === "login"}
        <Login />
    {:else}
        <Register />
    {/if}
</div>