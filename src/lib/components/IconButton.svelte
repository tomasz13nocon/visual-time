<script lang="ts">
  import Icon from "@iconify/svelte";

  export let small = false;
  export let medium = false;
  export let icon: string;
  export let element: HTMLButtonElement | undefined = undefined;
  export let title: string | undefined = undefined;

  const textSize = small ? "text-lg" : medium ? "text-xl" : "text-4xl";
</script>

<button
  class="btn shrink-0 btn-icon variant-soft-primary
  {textSize}
  {small ? 'btn-icon-xs' : ''}
  {medium ? 'btn-icon-sm' : ''}
  {$$props.class}"
  on:click
  bind:this={element}
  {title}
>
  <Icon {icon} />
</button>
