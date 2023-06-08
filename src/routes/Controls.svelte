<script lang="ts">
  import TaskListing from "./TaskListing.svelte";
  import {
    taskDraft,
    tracker,
    colors,
    createTaskDraft,
    type TagTemplate,
    fetchTagTemplates,
  } from "./task";
  import IconButton from "$lib/components/IconButton.svelte";
  import dayjs from "$lib/dayjs";
  import { selectedDate, user } from "$lib/stores";
  import { get, writable } from "svelte/store";
  import { Autocomplete, InputChip, localStorageStore } from "@skeletonlabs/skeleton";
  import ColorButton from "./ColorButton.svelte";
  import { slide } from "svelte/transition";
  import autoAnimate from "@formkit/auto-animate";
  import TaskNameInput from "./TaskNameInput.svelte";
  import TaskTagsInput from "./TaskTagsInput.svelte";

  const { tasks, activeTask } = tracker;
  let from = "";
  let to = "";
  let snapToLast = false;
  const showMoreColors = localStorageStore("showMoreColors", false);
  let addTaskError: {
    start?: boolean;
    end?: boolean;
    msg?: string;
  } = {};

  function getSnappedTime() {
    const now = Date.now();
    if (snapToLast) {
      for (const task of $tasks) {
        const taskEnd = get(task).endDate;
        if (taskEnd <= now) {
          return taskEnd;
        }
      }
    }
    return now;
  }

  function startTracking() {
    console.log($taskDraft);
    $taskDraft.startDate = getSnappedTime();
    tracker.addTask($taskDraft, true);
    $taskDraft = createTaskDraft($taskDraft);
  }

  function addTask() {
    //{{{
    addTaskError = {};

    const now = $selectedDate.format("YYYY-MM-DD") + "_";
    const format = "YYYY-MM-DD_H:m";
    $taskDraft.startDate = dayjs(now + from, format).valueOf();
    $taskDraft.endDate = dayjs(now + to, format).valueOf();

    if (isNaN($taskDraft.startDate)) {
      addTaskError.start = true;
      addTaskError.msg = "Invalid start time";
    }
    if (isNaN($taskDraft.endDate)) {
      addTaskError.end = true;
      addTaskError.msg = "Invalid end time";
    }
    if ($taskDraft.startDate >= $taskDraft.endDate) {
      addTaskError.start = true;
      addTaskError.end = true;
      addTaskError.msg = "Start time must be before end time";
    }
    if (addTaskError.msg) {
      return;
    }

    tracker.addTask($taskDraft);
    $taskDraft = createTaskDraft($taskDraft);
  } //}}}
</script>

<div class="p-2 flex flex-col gap-4 relative">
  <div class="flex gap-2 items-center">
    <TaskNameInput {startTracking} />

    <IconButton icon="eva:arrow-right-fill" on:click={startTracking} title="Start tracking" />

    <IconButton icon="eva:plus-fill" on:click={addTask} title="Add task entry" />
  </div>

  <TaskTagsInput />

  <label class="flex items-center space-x-2 w-fit">
    <input class="checkbox" type="checkbox" bind:checked={snapToLast} />
    <p>Start tracking from the end of last task</p>
  </label>

  <div>
    {#if addTaskError.msg}
      <div class="alert variant-ghost-error py-2 px-4 mb-2" transition:slide={{ duration: 300 }}>
        <div class="alert-message">
          {addTaskError.msg}
        </div>
        <div class="alert-actions">
          <IconButton small icon="eva:close-fill" on:click={() => (addTaskError = {})} />
        </div>
      </div>
    {/if}
    <div class="flex gap-2">
      <input
        class="input py-1 {addTaskError.start ? 'input-error' : ''}"
        type="time"
        bind:value={from}
      />
      <input
        class="input py-1 {addTaskError.end ? 'input-error' : ''}"
        type="time"
        bind:value={to}
      />
    </div>
  </div>

  <div>
    <div class="flex gap-1">
      {#each colors.slice(0, 8) as color}
        <ColorButton
          {color}
          selected={$taskDraft.color === color}
          on:click={() => {
            $taskDraft.color = color;
          }}
        />
      {/each}
    </div>
    {#if $showMoreColors}
      <div class="flex gap-1 mt-1">
        {#each colors.slice(8, 16) as color}
          <ColorButton
            {color}
            selected={$taskDraft.color === color}
            on:click={() => {
              $taskDraft.color = color;
            }}
          />
        {/each}
      </div>
    {/if}
    <button
      on:click={() => ($showMoreColors = !$showMoreColors)}
      class="block ml-auto mt-2 text-sm text-secondary-500"
    >
      {$showMoreColors ? "Less colors" : "More colors"}
    </button>
  </div>

  {#if $activeTask}
    <div class="flex flex-col gap-2">
      <TaskListing task={$activeTask} {getSnappedTime} />
    </div>
  {/if}
  <div use:autoAnimate class="flex flex-col gap-2">
    {#each $tasks as task (task)}
      <TaskListing {task} {getSnappedTime} excludeActive />
    {/each}
  </div>
</div>
