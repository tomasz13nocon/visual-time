<script>
  import { circleX, circleY, rInner, rOuter } from "./chart";
</script>

<g stroke="grey" fill="none">
  <circle cx={0} cy={0} r={rOuter} />
  <circle cx={0} cy={0} r={rInner} />
</g>
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
        x={circleX(i * 15 - 90, rOuter + 30)}
        y={circleY(i * 15 - 90, rOuter + 30)}
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {i}
      </text>
    {/if}
  {/each}
</g>
