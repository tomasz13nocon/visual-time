<script lang="ts">
  import { type Writable, get } from "svelte/store";
  import { colors, colorsLight, type Task } from "./task";
  import dayjs from "dayjs";
  import TaskArc from "./TaskArc.svelte";
  import { fromMs, rInner, rOuter } from "./chart";
  import BulletText from "./BulletText.svelte";
  import { clampEnd, clampStart } from "$lib/util";
  import { selectedDate, selectedDateEnd, selectedDateStart } from "$lib/stores";

  export let task: Writable<Task>;

  let startDate = dayjs($task.startDate);
  let endDate = dayjs($task.endDate);
  let diff = endDate.diff(startDate, "minute");
  const clampedStart = clampStart($task.startDate);
  const clampedEnd = clampEnd($task.endDate);
  let taskCenter = fromMs(clampedStart + (clampedEnd - clampedStart) / 2);
  let startTimePos = fromMs(clampedStart - 1000 * 60 * 5);
  let endTimePos = fromMs(clampedEnd + 1000 * 60 * 5);
  const diffDays = endDate.startOf("day").diff(startDate.startOf("day"), "day");
</script>

<TaskArc {task} outline fat />

<!-- title on circle -->
<BulletText
  x={taskCenter.toPosX(rOuter - (rOuter - rInner) / 2)}
  y={taskCenter.toPosY(rOuter - (rOuter - rInner) / 2)}
  color={colorsLight[colors.indexOf($task.color)] ?? $task.color}
>
  {$task.name}
</BulletText>

<!-- center info -->
<g text-anchor="middle" dominant-baseline="middle" transform="translate(0, -70)">
  <text text-anchor="middle" dominant-baseline="middle" class="text-xl font-light">
    {$task.name}
  </text>
  <text
    text-anchor="middle"
    dominant-baseline="middle"
    transform="translate(0, 30)"
    class="text-sm"
  >
    🕓
    {#if diff >= 60}
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
    {#if $task.active}
      ⌛ Ongoing
    {:else}
      ✅ Finished {endDate.fromNow()}
    {/if}
  </text>
</g>

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
