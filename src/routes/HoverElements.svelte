<script lang="ts">
  import type { Writable } from "svelte/store";
  import { colors, colorsLight, type Task } from "./task";
  import TaskArc from "./TaskArc.svelte";
  import { fromMs, rInner, rOuter } from "./chart";
  import BulletText from "./BulletText.svelte";
  import { clampEnd, clampStart } from "$lib/util";
  import TaskTimes from "./TaskTimes.svelte";
  import { getContext } from "svelte";
  import { fade, scale } from "svelte/transition";

  export let task: Writable<Task>;
  export let mousePos: DOMPoint;
  export let resizingStart: Writable<Task> | null;
  export let resizingEnd: Writable<Task> | null;

  let selected: Writable<boolean> = getContext("selected");

  $: clampedStart = clampStart($task.startDate);
  $: clampedEnd = clampEnd($task.endDate);
  $: taskCenter = fromMs(clampedStart + (clampedEnd - clampedStart) / 2);

  $: startResizeBtnPosX = fromMs(clampedStart).toPosX(rOuter - 1);
  $: startResizeBtnPosY = fromMs(clampedStart).toPosY(rOuter - 1);
  $: endResizeBtnPosX = fromMs(clampedEnd).toPosX(rOuter - 1);
  $: endResizeBtnPosY = fromMs(clampedEnd).toPosY(rOuter - 1);
  const resizeBtnRadius = 25;
  $: startResizeBtnMouseD = Math.hypot(
    mousePos.x - startResizeBtnPosX,
    mousePos.y - startResizeBtnPosY
  );
  $: endResizeBtnMouseD = Math.hypot(mousePos.x - endResizeBtnPosX, mousePos.y - endResizeBtnPosY);

  function resizeBtnMouseDown() {
    if (startResizeBtnMouseD < endResizeBtnMouseD) {
      resizingStart = task;
    } else {
      resizingEnd = task;
    }
  }
</script>

<TaskArc {task} outline fat={!$selected} fatter={$selected} />

<!-- start and end times -->
<TaskTimes {task} />

<!-- title on circle -->
{#if !$selected}
  {#key $task}
    <BulletText
      x={taskCenter.toPosX(rOuter - (rOuter - rInner) / 2)}
      y={taskCenter.toPosY(rOuter - (rOuter - rInner) / 2)}
      color={colorsLight[colors.indexOf($task.color)] ?? $task.color}
    >
      {$task.name}
    </BulletText>
  {/key}
{/if}

<!-- time editing controls -->
{#if $selected}
  <g stroke={$task.color} stroke-width="1" cursor="pointer" on:mousedown={resizeBtnMouseDown}>
    <circle
      cx={startResizeBtnPosX}
      cy={startResizeBtnPosY}
      r={(startResizeBtnMouseD < resizeBtnRadius && startResizeBtnMouseD < endResizeBtnMouseD) ||
      resizingStart
        ? resizeBtnRadius
        : "6"}
      fill={$task.color + (resizingStart ? "bb" : "88")}
    />
    <circle
      cx={endResizeBtnPosX}
      cy={endResizeBtnPosY}
      r={(endResizeBtnMouseD < resizeBtnRadius && endResizeBtnMouseD < startResizeBtnMouseD) ||
      resizingEnd
        ? resizeBtnRadius
        : "6"}
      fill={$task.color + (resizingEnd ? "bb" : "88")}
    />
  </g>
{/if}
