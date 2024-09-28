<script>
  import { goto } from "$app/navigation";
  import { userStore } from "$lib/store/userInfoStore";
  import { get } from "svelte/store";

  const userInfo = get(userStore);
  goto("/chat/" + userInfo.channelJoined[0]);
</script>
