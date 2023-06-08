<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Task } from "./task";
  import { clampEnd, clampStart } from "$lib/util";
  import dayjs from "$lib/dayjs";
  import { selectedDate, selectedDateEnd, selectedDateStart } from "$lib/stores";
  import OverflowBullet from "./OverflowBullet.svelte";

  export let task: Writable<Task>;
</script>

{#if $task.startDate < $selectedDateStart.valueOf()}
  <!-- TODO pass number, not task, to aboid rerenders -->
  <OverflowBullet negative {task} />
{/if}
{#if $task.endDate - 1 > $selectedDateEnd.valueOf()}
  <OverflowBullet {task} />
{/if}
