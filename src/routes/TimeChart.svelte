<script lang="ts">
  import dayjs from "dayjs";
  import { tracker } from "./Task";

  const r = 360;
  const r2 = 240;
  const pi180 = Math.PI / 180;

  function circleX(angle: number, radius: number) {
    return radius * Math.cos(angle * pi180);
  }
  function circleY(angle: number, radius: number) {
    return radius * Math.sin(angle * pi180);
  }
  // angle to position on a circle with given radius as string "x y"
  function atop(angle: number, radius: number) {
    return `${circleX(angle, radius)} ${circleY(angle, radius)}`;
  }
</script>

<svg viewBox="-400 -400 800 800" height="100%" width="100%" class="mx-auto">
  <g stroke="grey" fill="none">
    <circle cx={0} cy={0} {r} />
    <circle cx={0} cy={0} r={r2} />
  </g>
  <g class="stroke-surface-300">
    {#each Array(24) as _, i}
      <path
        d="M0 {r2} V {r}"
        transform="rotate({i * 15})"
        stroke-dasharray="2 3"
        stroke-dashoffset="2"
      />
      {#if i % 3 === 0}
        <text
          class="text-sm font-thin"
          x={circleX(i * 15 - 90, r + 30)}
          y={circleY(i * 15 - 90, r + 30)}
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {i}
        </text>
      {/if}
    {/each}
  </g>

  {#each $tracker.tasks as task}
    {@const startDate = dayjs(task.startTime)}
    {@const startDeg = (startDate.diff(dayjs().startOf("day")) / 86400000) * 360 - 90}
    {@const endDate = dayjs(task.endTime)}
    {@const endDeg = (endDate.diff(dayjs().startOf("day")) / 86400000) * 360 - 90}
    <path
      d="M {atop(startDeg, r2)}
         L {atop(startDeg, r)}
         A {r} {r} 0 0 1 {atop(endDeg, r)} L {atop(endDeg, r2)}
         A {r2} {r2} 0 0 0 {atop(startDeg, r2)}"
      stroke={task.color}
      fill={task.color + "44"}
    />
    <text
      class="text-xs font-thin fill-token"
      x={circleX(startDeg, r + 15)}
      y={circleY(startDeg, r + 15)}
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {startDate.format("H:mm")}
    </text>
    <!-- <text -->
    <!--   class="text-xs font-thin" -->
    <!--   x={circleX(endDeg, r + 14)} -->
    <!--   y={circleY(endDeg, r + 14)} -->
    <!--   text-anchor="middle" -->
    <!--   dominant-baseline="middle" -->
    <!-- > -->
    <!--   {endDate.getHours()}:{endDate.getMinutes().toString().padStart(2, "0")} -->
    <!-- </text> -->
  {/each}
</svg>
