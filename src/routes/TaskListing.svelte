<script lang="ts">
  import Icon from "@iconify/svelte";
  import { tracker, Task } from "./Task";
  import IconButton from "$lib/IconButton.svelte";
  import dayjs from "dayjs";

  export let task: Task;

  $: activeTaskElapsed = task.endTime - task.startTime;
</script>

<div class="flex justify-between">
  <div
    class="px-2 rounded-token border-2"
    style:background-color={task.color + "22"}
    style:border-color={task.color}
  >
    {task.name || "Unnamed Task"}
  </div>
  <div class="flex gap-2">
    {#if task.active}
      <IconButton icon="eva:square-fill" small />
    {/if}
    <div class="text-xl">
      {`${Math.floor(activeTaskElapsed / 1000 / 60 / 60)}:${Math.floor(
        (activeTaskElapsed / 1000 / 60) % 60
      )
        .toString()
        .padStart(2, "0")}:${Math.floor((activeTaskElapsed / 1000) % 60)
        .toString()
        .padStart(2, "0")}`}
    </div>
    <IconButton
      icon="eva:trash-2-outline"
      small
      on:click={() => {
        $tracker.stop();
        $tracker.removeTask(task.id);
        $tracker.tasks = $tracker.tasks;
      }}
    />
  </div>
</div>

<div class="w-fit ml-auto text-sm">
  {dayjs(task.startTime).format("H:mm")}
  -
  {#if !task.active}
    {dayjs(task.endTime).format("H:mm")}
  {/if}
</div>
