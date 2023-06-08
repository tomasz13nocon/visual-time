<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Task } from "./task";
  import { fromMs, rInner } from "./chart";
  import dayjs from "$lib/dayjs";
  import { clampEnd, clampStart } from "$lib/util";
  import { selectedDate } from "$lib/stores";

  export let task: Writable<Task>;

  $: startDate = dayjs($task.startDate);
  $: endDate = dayjs($task.endDate);
  $: clampedStart = clampStart($task.startDate);
  $: clampedEnd = clampEnd($task.endDate);
  // Display start and end timea further apart if the task is short to avoid overlap
  $: timeDisplayOffset =
    1000 * 60 * (Math.max(-endDate.diff(startDate, "minute") + 25, 0) * 0.5 + 5);
  $: startTimePos = fromMs(clampedStart - timeDisplayOffset);
  $: endTimePos = fromMs(clampedEnd + timeDisplayOffset);
  $: diffDays = endDate.startOf("day").diff(startDate.startOf("day"), "day");
</script>

{#if $task.startDate !== $task.endDate}
  <g class="text-xs font-extralight select-none" text-anchor="middle" dominant-baseline="middle">
    <text x={startTimePos.toPosX(rInner - 18)} y={startTimePos.toPosY(rInner - 18)}>
      {startDate.format("H:mm")}
      {#if !startDate.isSame($selectedDate, "day")}
        {` (-${diffDays}d)`}
      {/if}
    </text>
    <text x={endTimePos.toPosX(rInner - 18)} y={endTimePos.toPosY(rInner - 18)}>
      {#if $task.active}
        now
      {:else}
        {endDate.format("H:mm")}
      {/if}
      {#if !endDate.subtract(1, "ms").isSame($selectedDate, "day")}
        {` (+${diffDays}d)`}
      {/if}
    </text>
  </g>
{/if}
