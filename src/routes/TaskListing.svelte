<script lang="ts">
  import { tracker, Task } from "./task";
  import IconButton from "$lib/components/IconButton.svelte";
  import dayjs from "$lib/dayjs";
  import type { Writable } from "svelte/store";
  import { getContext } from "svelte";

  export let task: Writable<Task>;
  export let getSnappedTime: () => number;
  export let excludeActive = false;

  let hovered: Writable<Writable<Task> | null> = getContext("hovered");
  let selected: Writable<boolean> = getContext("selected");

  $: activeTaskElapsed = $task.endDate - $task.startDate;
</script>

{#if !(excludeActive && $task.active)}
  <div
    class="-mx-2 -my-1 px-2 py-1
    {$task.active ? 'drop-shadow-lg bg-secondary-100/70 dark:bg-secondary-900 mb-2' : ''}
    {$hovered === task ? '!bg-secondary-300/50 dark:!bg-secondary-900/75' : ''}"
    on:mouseenter={() => {
      if (!$selected) $hovered = task;
    }}
    on:mouseleave={() => {
      if (!$selected) $hovered = null;
    }}
  >
    <div class="flex justify-between gap-2">
      <div class="flex gap-2 items-center">
        <div class="bg-surface-50-900-token rounded-md">
          <div
            class="px-2 rounded-md border-2"
            style:background-color={$task.color + "22"}
            style:border-color={$task.color}
          >
            {$task.name}
          </div>
        </div>
        {#if !$task.active}
          <IconButton
            icon="eva:arrow-right-fill"
            small
            on:click={() => {
              const newTask = new Task($task);
              newTask.startDate = getSnappedTime();
              tracker.addTask(newTask, true);
            }}
            title="Start tracking this task"
          />
        {/if}
      </div>

      <div class="flex gap-2 items-center">
        {#if $task.active}
          <IconButton
            icon="eva:square-fill"
            small
            on:click={() => tracker.stop()}
            title="Stop tracking"
          />
        {/if}
        <div class="text-xl">
          {`${
            activeTaskElapsed >= 1000 * 60 * 60
              ? Math.floor(activeTaskElapsed / 1000 / 60 / 60) + ":"
              : ""
          }${Math.floor((activeTaskElapsed / 1000 / 60) % 60)
            .toString()
            .padStart(2, "0")}:${Math.floor((activeTaskElapsed / 1000) % 60)
            .toString()
            .padStart(2, "0")}`}
        </div>
        <IconButton
          icon="eva:trash-2-outline"
          small
          on:click={() => {
            tracker.removeTask($task);
          }}
          title="Remove task entry"
        />
      </div>
    </div>

    <div class="flex justify-between mt-1">
      <div class="flex gap-1" />
      <div class="w-fit text-sm">
        {dayjs($task.startDate).format("H:mm")}
        -
        {#if !$task.active}
          {dayjs($task.endDate).format("H:mm")}
        {/if}
      </div>
    </div>
  </div>
{/if}
