<script lang="ts">
  import { type Writable, get } from "svelte/store";
  import { colors, colorsLight, type Task } from "./task";
  import dayjs from "dayjs";
  import TaskArc from "./TaskArc.svelte";
  import { fromMs, rInner, rOuter } from "./chart";
  import BulletText from "./BulletText.svelte";
  import { clampEnd, clampStart } from "$lib/util";
  import { selectedDate } from "$lib/stores";

  export let task: Writable<Task>;
  export let selected: boolean;
  export let mousePos: DOMPoint;
  export let resizingStart: Writable<Task> | null;
  export let resizingEnd: Writable<Task> | null;

  $: startDate = dayjs($task.startDate);
  $: endDate = dayjs($task.endDate);
  $: clampedStart = clampStart($task.startDate);
  $: clampedEnd = clampEnd($task.endDate);
  $: taskCenter = fromMs(clampedStart + (clampedEnd - clampedStart) / 2);
  // Display start and end timea further apart if the task is short to avoid overlap
  $: timeDisplayOffset =
    1000 * 60 * (Math.max(-endDate.diff(startDate, "minute") + 25, 0) * 0.5 + 5);
  $: startTimePos = fromMs(clampedStart - timeDisplayOffset);
  $: endTimePos = fromMs(clampedEnd + timeDisplayOffset);
  $: diffDays = endDate.startOf("day").diff(startDate.startOf("day"), "day");

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

<TaskArc {task} outline fat={!selected} fatter={selected} />

<!-- start and end times -->
<g class="text-xs font-extralight select-none" text-anchor="middle" dominant-baseline="middle">
  <text x={startTimePos.toPosX(rInner - 18)} y={startTimePos.toPosY(rInner - 18)}>
    {startDate.format("H:mm")}
    {#if !startDate.isSame(get(selectedDate), "day")}
      {` (-${diffDays}d)`}
    {/if}
  </text>
  <text x={endTimePos.toPosX(rInner - 18)} y={endTimePos.toPosY(rInner - 18)}>
    {#if $task.active}
      now
    {:else}
      {endDate.format("H:mm")}
    {/if}
    {#if !endDate.isSame(get(selectedDate), "day")}
      {` (+${diffDays}d)`}
    {/if}
  </text>
</g>

<!-- title on circle -->
{#key $task}
  <BulletText
    x={taskCenter.toPosX(rOuter - (rOuter - rInner) / 2)}
    y={taskCenter.toPosY(rOuter - (rOuter - rInner) / 2)}
    color={colorsLight[colors.indexOf($task.color)] ?? $task.color}
  >
    {$task.name}
  </BulletText>
{/key}

<!-- time editing controls -->
{#if selected}
  <g stroke={$task.color} stroke-width="1" cursor="pointer">
    <circle
      cx={startResizeBtnPosX}
      cy={startResizeBtnPosY}
      r={(startResizeBtnMouseD < resizeBtnRadius && startResizeBtnMouseD < endResizeBtnMouseD) ||
      resizingStart
        ? resizeBtnRadius
        : "6"}
      fill={$task.color + (resizingStart ? "bb" : "88")}
      on:mousedown={resizeBtnMouseDown}
    />
    <circle
      cx={endResizeBtnPosX}
      cy={endResizeBtnPosY}
      r={(endResizeBtnMouseD < resizeBtnRadius && endResizeBtnMouseD < startResizeBtnMouseD) ||
      resizingEnd
        ? resizeBtnRadius
        : "6"}
      fill={$task.color + (resizingEnd ? "bb" : "88")}
      on:mousedown={resizeBtnMouseDown}
    />
  </g>
{/if}
