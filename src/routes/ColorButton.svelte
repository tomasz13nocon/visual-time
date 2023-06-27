<script lang="ts">
  export let color: string;
  export let selected: boolean;
  export let small = false;
  export let ariaLabel: string;
</script>

<button
  class="btn-icon {small ? 'btn-icon-sm' : ''} {selected ? 'ring-2 ring-surface-900-50-token' : ''}"
  style:background-color={color}
  on:click
  aria-label={ariaLabel}
/>
