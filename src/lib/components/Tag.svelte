<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { Tag } from "../../routes/task";

  export let tag: Tag;
</script>

<div class="badge variant-filled-surface">
  <Icon icon="eva:pricetags-fill" class="mr-1" />
  {tag.name}
</div>
