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

  $: startDate = dayjs($task.startDate);
  $: endDate = dayjs($task.endDate);
  $: clampedStart = clampStart($task.startDate);
  $: clampedEnd = clampEnd($task.endDate);
  $: taskCenter = fromMs(clampedStart + (clampedEnd - clampedStart) / 2);
  $: startTimePos = fromMs(clampedStart - 1000 * 60 * 5);
  $: endTimePos = fromMs(clampedEnd + 1000 * 60 * 5);
  $: diffDays = endDate.startOf("day").diff(startDate.startOf("day"), "day");
</script>

<TaskArc {task} outline fat={!selected} fatter={selected} />

<!-- start and end times -->
<text
  class="text-xs font-extralight"
  x={startTimePos.toPosX(rOuter + 18)}
  y={startTimePos.toPosY(rOuter + 18)}
  text-anchor="middle"
  dominant-baseline="middle"
>
  {startDate.format("H:mm")}
  {#if !startDate.isSame(get(selectedDate), "day")}
    {` (-${diffDays}d)`}
  {/if}
</text>
<text
  class="text-xs font-extralight"
  x={endTimePos.toPosX(rOuter + 18)}
  y={endTimePos.toPosY(rOuter + 18)}
  text-anchor="middle"
  dominant-baseline="middle"
>
  {#if $task.active}
    now
  {:else}
    {endDate.format("H:mm")}
  {/if}
  {#if !endDate.isSame(get(selectedDate), "day")}
    {` (+${diffDays}d)`}
  {/if}
</text>

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
