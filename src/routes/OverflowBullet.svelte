<script lang="ts">
  import { get, type Writable } from "svelte/store";
  import { type Task, colors, colorsLight } from "./task";
  import { clampEnd, clampStart } from "$lib/util";
  import BulletText from "./BulletText.svelte";
  import { fromMs, rInner } from "./chart";
  import dayjs from "$lib/dayjs";
  import { selectedDate, overflowBulletCount } from "$lib/stores";
  import { onDestroy, onMount } from "svelte";

  export let negative = false;
  export let task: Writable<Task>;

  // onMount(() => overflowBulletCount.update((s) => s + 1));
  onDestroy(() => overflowBulletCount.update((s) => s - 1));

  overflowBulletCount.update((s) => s + 1);
  const radius = rInner + 24 * ($overflowBulletCount - 1);

  $: clampedDate = negative ? clampStart($task.startDate) : clampEnd($task.endDate);
  $: diffDays = Math.abs(
    get(selectedDate)
      .startOf("day")
      .diff(dayjs(negative ? $task.startDate : $task.endDate).startOf("day"), "day")
  );
</script>

<BulletText
  x={fromMs(clampedDate).toPosX(radius)}
  y={fromMs(clampedDate).toPosY(radius)}
  color={colorsLight[colors.indexOf($task.color)] ?? $task.color}
>
  {negative ? "-" : "+"}{diffDays}d
</BulletText>
