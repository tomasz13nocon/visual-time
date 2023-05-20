<script>
  import { selectedDateStart } from "$lib/stores";

  // Using masks and clip to do inner and outer strokes, so that task arcs fully cover the base
  import { fromDeg, rInner, rOuter } from "./chart";
</script>

<defs>
  <circle id="outer-chart-base" cx={0} cy={0} r={rOuter} />
  <circle id="inner-chart-base" cx={0} cy={0} r={rInner} />
  <clipPath id="outer-chart-base-clip">
    <use href="#outer-chart-base" />
  </clipPath>
  <mask id="inner-chart-base-mask">
    <rect x="-100%" y="-100%" width="200%" height="200%" fill="white" />
    <use href="#inner-chart-base" fill="black" />
  </mask>
</defs>

<g class="stroke-surface-300">
  {#each Array(24) as _, i}
    <!-- hour line -->
    <path
      d="M0 {rInner} V {rOuter}"
      transform="rotate({i * 15})"
      stroke-dasharray="2 3"
      stroke-dashoffset="2"
    />
    {#if i % 3 === 0}
      <!-- hour text -->
      <text
        class="text-sm font-thin select-none"
        x={fromDeg(i * 15, $selectedDateStart).toPosX(rOuter + 30)}
        y={fromDeg(i * 15, $selectedDateStart).toPosY(rOuter + 30)}
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {i}
      </text>
    {/if}
  {/each}
</g>

<!-- this goes at the bottom for mouse events to work correctly -->
<g stroke="grey" fill="#0000" stroke-width="2">
  <use
    href="#outer-chart-base"
    clip-path="url(#outer-chart-base-clip)"
    on:mouseenter
    on:mouseleave
    on:mousemove
    on:mousedown
    on:mouseup
  />
  <use href="#inner-chart-base" mask="url(#inner-chart-base-mask)" />
</g>
