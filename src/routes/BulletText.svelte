<script lang="ts">
  import { textColorOn } from "$lib/util";

  export let x: number;
  export let y: number;
  export let color = "#888888";

  let titleBulletEl: SVGGraphicsElement | null = null;
  let titleBulletWidth = 0;

  function updateTitleBulletWidth(el: SVGGraphicsElement | null) {
    titleBulletWidth = el?.getBBox().width ?? 0;
  }
  $: updateTitleBulletWidth(titleBulletEl);
</script>

<g class="pointer-events-none select-none">
  <rect
    x={x - titleBulletWidth / 2 - 10}
    y={y - 10}
    width={titleBulletWidth + 20}
    height="20"
    fill={color}
    rx="5"
  />
  <text
    class="text-xs font-normal"
    {x}
    {y}
    text-anchor="middle"
    dominant-baseline="middle"
    bind:this={titleBulletEl}
    fill={textColorOn(color, "#fff", "#000")}
  >
    <slot />
  </text>
</g>
