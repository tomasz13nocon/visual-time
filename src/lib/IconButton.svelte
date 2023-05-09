<script lang="ts">
  import Icon from "@iconify/svelte";

  export let small = false;
  export let icon: string;
</script>

<button class="variant-soft-primary {small ? 'btn-icon-xs' : 'btn-icon text-4xl'}" on:click>
  <Icon {icon} />
</button>
