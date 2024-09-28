<script lang="ts">
    import { onMount } from "svelte";

    export const ssr = false;

    const sidebarButtonClick = (event: MouseEvent) => {
        const sidebarElement = document.getElementById("default-sidebar");
        if (sidebarElement) {
            // -translate-x-full のclassを削除
            sidebarElement.classList.remove("-translate-x-full");
            //transform-none のclassを追加
            sidebarElement.classList.add("transform-none");
            //<div id="sidever-dialog" class="bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30"></div>の要素を付与
            const sideverDialog = document.getElementById("sidever-dialog");
            if (sideverDialog) {
                sideverDialog.classList.add("bg-gray-900/50");
                sideverDialog.classList.add("dark:bg-gray-900/80");
                sideverDialog.classList.add("fixed");
                sideverDialog.classList.add("inset-0");
                sideverDialog.classList.add("z-30");
            }
        }
    };

    const sidebarCloseButtonClick = (event: MouseEvent) => {
        const sidebarElement = document.getElementById("default-sidebar");
        if (sidebarElement) {
            //transform-none のclassを削除
            sidebarElement.classList.remove("transform-none");
            //-translate-x-full のclassを追加
            sidebarElement.classList.add("-translate-x-full");
            //<div id="sidever-dialog" class="bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30"></div>の要素を削除
            const sideverDialog = document.getElementById("sidever-dialog");
            if (sideverDialog) {
                sideverDialog.classList.remove("bg-gray-900/50");
                sideverDialog.classList.remove("dark:bg-gray-900/80");
                sideverDialog.classList.remove("fixed");
                sideverDialog.classList.remove("inset-0");
                sideverDialog.classList.remove("z-30");
            }
        }
    };

    import "../app.css";

    onMount(() => {
        console.log("+layout :: トップ", location);
    });
</script>

{#if !location.pathname.startsWith("/auth")}
    <button on:click={sidebarCloseButtonClick} id="sidever-dialog" type="button" aria-label="Close sidebar"></button>
    <button on:click={sidebarButtonClick} data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
        <span class="sr-only">Open sidebar</span>
        <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
        </svg>
    </button>
    
    <aside id="default-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"  aria-label="Sidebar" aria-modal="true" role="dialog">
        <div class="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <ul class="space-y-2 font-medium">
                <li>
                    <span class="ms-3">チャンネルリスト</span>
                </li>
                <li>
                    <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <span class="flex-1 ms-3 whitespace-nowrap">test</span>
                    </a>
                </li>
            </ul>
        </div>
    </aside>
{/if}
 
 <div class="p-4 sm:ml-64">
    <slot/>
 </div>
 