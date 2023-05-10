<script lang="ts">
  import dayjs from "dayjs";
  import { Task, tracker } from "./task";
  import { atop, circleX, circleY, getTaskInfo, rInner, rOuter } from "./chart";
  import TaskArc from "./TaskArc.svelte";
  import ChartBase from "./ChartBase.svelte";

  let tasks = tracker.tasks;

  let hovered: Task | null = null;
  let titleBulletEl: SVGGraphicsElement | null = null;
  let titleBulletWidth = 0;

  function updateTitleBulletWidth(el: SVGGraphicsElement | null) {
    if (hovered) {
      titleBulletWidth = el?.getBBox().width ?? 0;
    }
  }
  $: updateTitleBulletWidth(titleBulletEl);
</script>

<svg viewBox="-400 -400 800 800" height="100%" width="100%" class="mx-auto fill-token">
  <ChartBase />

  {#each $tasks as task}
    <TaskArc bind:task bind:hovered />
  {/each}

  {#if hovered}
    {@const { startDate, startDeg, endDate, endDeg } = getTaskInfo(hovered)}
    {@const diff = endDate.diff(startDate, "minute")}

    <!-- hovered task arc -->
    <path
      d="M {atop(startDeg, rInner)}
      L {atop(startDeg, rOuter)}
      A {rOuter} {rOuter} 0 0 1 {atop(endDeg, rOuter)} L {atop(endDeg, rInner)}
      A {rInner} {rInner} 0 0 0 {atop(startDeg, rInner)}"
      stroke={hovered.color}
      fill="none"
      stroke-width="2"
    />

    <!-- title on circle -->
    {@const titleX = circleX((startDeg + endDeg) / 2, rOuter - (rOuter - rInner) * 0.5)}
    {@const titleY = circleY((startDeg + endDeg) / 2, rOuter - (rOuter - rInner) * 0.5)}
    <g class="pointer-events-none">
      <rect
        x={titleX - titleBulletWidth / 2 - 10}
        y={titleY - 10}
        width={titleBulletWidth + 20}
        height="20"
        fill={hovered.color}
        rx="5"
      />
      <text
        class="text-xs font-normal"
        x={titleX}
        y={titleY}
        text-anchor="middle"
        dominant-baseline="middle"
        bind:this={titleBulletEl}
      >
        {hovered.name}
      </text>
    </g>

    <!-- center info -->
    <g text-anchor="middle" dominant-baseline="middle" transform="translate(0, -70)">
      <text text-anchor="middle" dominant-baseline="middle" class="text-xl font-light">
        {hovered.name}
      </text>
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        transform="translate(0, 30)"
        class="text-sm"
      >
        🕓
        {#if diff > 60}
          {Math.floor(diff / 60)} hour{Math.floor(diff / 60) === 1 ? "" : "s"},{" "}
        {/if}
        {diff % 60} minute{diff % 60 === 1 ? "" : "s"}
      </text>
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        transform="translate(0, 50)"
        class="text-sm"
      >
        {#if hovered.active}
          ⌛ Ongoing
        {:else}
          ✅ Finished {endDate.fromNow()}
        {/if}
      </text>
    </g>

    <!-- start and end times -->
    <text
      class="text-xs font-extralight"
      x={circleX(startDeg - 1.5, rOuter + 18)}
      y={circleY(startDeg - 1.5, rOuter + 18)}
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {startDate.format("H:mm")}
    </text>
    <text
      class="text-xs font-extralight"
      x={circleX(endDeg + 1.5, rOuter + 18)}
      y={circleY(endDeg + 1.5, rOuter + 18)}
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {#if hovered.active}
        now
      {:else}
        {endDate.format("H:mm")}
      {/if}
    </text>
  {/if}
</svg>
