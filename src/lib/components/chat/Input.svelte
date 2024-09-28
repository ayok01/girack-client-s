<script lang="ts">
    import { socket } from "$lib/socketHandler/socketInit";
    
    const channelId = path.split('/').pop()?.toString(); //チャンネルId
    let message = ""; //メッセージ入力用

</script>

<input
    type="text"
    bind:value={message}
    placeholder="Type your message..."
    class="flex-grow p-2 border rounded-l-lg"
/>
<button on:click={} class="p-2 bg-blue-500 text-white rounded-r-lg">Send</button>