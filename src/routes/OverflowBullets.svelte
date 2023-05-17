<script lang="ts">
  import { get, type Writable } from "svelte/store";
  import { type Task, colors, colorsLight } from "./task";
  import { clampEnd, clampStart } from "$lib/util";
  import BulletText from "./BulletText.svelte";
  import { fromMs, rInner } from "./chart";
  import dayjs from "$lib/dayjs";
  import { selectedDate } from "$lib/stores";

  export let task: Writable<Task>;

  $: clampedStart = clampStart($task.startDate);
  $: clampedEnd = clampEnd($task.endDate);
  $: diffDaysMinus = Math.abs(
    dayjs(get(selectedDate)).startOf("day").diff(dayjs($task.startDate).startOf("day"), "day")
  );
  $: diffDaysPlus = Math.abs(
    dayjs(get(selectedDate)).startOf("day").diff(dayjs($task.endDate).startOf("day"), "day")
  );
</script>

{#if clampedStart !== $task.startDate}
  <BulletText
    x={fromMs(clampedStart).toPosX(rInner)}
    y={fromMs(clampedStart).toPosY(rInner)}
    color={colorsLight[colors.indexOf($task.color)] ?? $task.color}
  >
    -{diffDaysMinus}d
  </BulletText>
{/if}
{#if clampedEnd !== $task.endDate}
  <BulletText
    x={fromMs(clampedEnd).toPosX(rInner)}
    y={fromMs(clampedEnd).toPosY(rInner)}
    color={colorsLight[colors.indexOf($task.color)] ?? $task.color}
  >
    +{diffDaysPlus}d
  </BulletText>
{/if}
