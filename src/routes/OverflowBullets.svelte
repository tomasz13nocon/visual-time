<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Task } from "./task";
  import { clampEnd, clampStart } from "$lib/util";
  import dayjs from "$lib/dayjs";
  import { selectedDate, selectedDateEnd, selectedDateStart } from "$lib/stores";
  import OverflowBullet from "./OverflowBullet.svelte";

  export let task: Writable<Task>;

  // $: clampedStart = clampStart($task.startDate);
  // $: clampedEnd = clampEnd($task.endDate);
</script>

<!-- {#if dayjs($task.startDate).isSame($selectedDate, "day") || dayjs($task.endDate).isSame($selectedDate, "day")} -->
<!-- {#if clampedStart !== $task.startDate} -->
{#if $task.startDate < $selectedDateStart.valueOf()}
  <!-- TODO pass number, not task, to aboid rerenders -->
  <OverflowBullet negative {task} />
{/if}
<!-- {/if} -->
<!-- {#if clampedEnd !== $task.endDate} -->
{#if $task.endDate > $selectedDateEnd.valueOf()}
  <OverflowBullet {task} />
{/if}
<!-- {/if} -->
<!-- {/if} -->
