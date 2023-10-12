<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { Tag } from "../../routes/task";

  export let tag: Tag;
  export let button = false;
</script>

{#if button}
  <button class="badge variant-filled-surface hover:brightness-110 transition-[filter]" on:click>
    <Icon icon="eva:pricetags-fill" class="mr-1" />
    {tag.name}
    <Icon icon="eva:close-fill" class="" />
  </button>
{:else}
  <div class="badge variant-filled-surface">
    <Icon icon="eva:pricetags-fill" class="mr-1" />
    {tag.name}
  </div>
{/if}
