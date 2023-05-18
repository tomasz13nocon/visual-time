<script lang="ts">
  import Icon from "@iconify/svelte";

  export let small = false;
  export let icon: string;
</script>

<button
  class="shrink-0 btn-icon variant-soft-primary
  {small ? 'btn-icon-xs' : 'text-4xl'}
  {$$props.class}"
  on:click
>
  <Icon {icon} />
</button>
