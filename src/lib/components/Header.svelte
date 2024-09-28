<script>
  import { IconHeart } from "@tabler/icons-svelte";
  // props
  export let channelName = "";
</script>

<div class="flex p-2">
  <div class="flex items-center sm:text-center md:text-left">
    <IconHeart size={20} stroke={1} />
    <h1 class="ml-2 font-bold">{channelName}</h1>
  </div>
</div>
