<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Task } from "./task";
  import dayjs from "dayjs";
  import TaskArc from "./TaskArc.svelte";
  import { fromMs, rInner, rOuter } from "./chart";
  import BulletText from "./BulletText.svelte";

  export let task: Writable<Task>;

  let startDate = dayjs($task.startDate);
  let endDate = dayjs($task.endDate);
  let diff = endDate.diff(startDate, "minute");
  let taskCenter = fromMs($task.startDate + ($task.endDate - $task.startDate) / 2);
  let startTimePos = fromMs($task.startDate - 1000 * 60 * 5);
  let endTimePos = fromMs($task.endDate + 1000 * 60 * 5);
</script>

<TaskArc {task} outline fat />

<!-- title on circle -->
<BulletText
  x={taskCenter.toPosX(rOuter - (rOuter - rInner) / 2)}
  y={taskCenter.toPosY(rOuter - (rOuter - rInner) / 2)}
  color={$task.color}
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
</text>
