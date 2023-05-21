<script lang="ts">
  import TaskListing from "./TaskListing.svelte";
  import { Task, taskDraft, tracker, colors, createTaskDraft } from "./task";
  import IconButton from "$lib/components/IconButton.svelte";
  import dayjs from "$lib/dayjs";
  import { selectedDate } from "$lib/stores";
  import { get, type Writable } from "svelte/store";
  import { localStorageStore } from "@skeletonlabs/skeleton";
  import ColorButton from "./ColorButton.svelte";

  let tasks = tracker.tasks;
  let from = "";
  let to = "";
  let snapToLast = false;
  let showMoreColors = localStorageStore("showMoreColors", false);

  function startTracking() {
    if (snapToLast && $tasks.length) {
      $taskDraft.startDate = get($tasks[0]).endDate;
    } else {
      $taskDraft.startDate = Date.now();
    }

    tracker.addTask($taskDraft, true);
    $taskDraft = createTaskDraft($taskDraft);
  }
</script>

<div class="p-2 flex flex-col gap-4">
  <div class="flex gap-2 items-center">
    <label class="label">
      <input
        class="input"
        type="text"
        placeholder="What are you working on?"
        bind:value={$taskDraft.name}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            startTracking();
          }
        }}
      />
    </label>

    <IconButton icon="eva:arrow-right-fill" on:click={startTracking} />

    <IconButton
      icon="eva:plus-fill"
      on:click={() => {
        const now = $selectedDate.format("YYYY-MM-DD") + "_";
        const format = "YYYY-MM-DD_H:m";
        $taskDraft.startDate = dayjs(now + from, format).valueOf();
        $taskDraft.endDate = dayjs(now + to, format).valueOf();
        tracker.addTask($taskDraft);
        $taskDraft = createTaskDraft($taskDraft);
      }}
    />
  </div>

  <label class="flex items-center space-x-2 w-fit">
    <input class="checkbox" type="checkbox" bind:checked={snapToLast} />
    <p>Start tracking from the end of last task</p>
  </label>

  <div class="flex gap-2">
    <input class="input py-1" type="time" bind:value={from} />
    <input class="input py-1" type="time" bind:value={to} />
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

  <div class="flex flex-col gap-2">
    {#each $tasks as task}
      <TaskListing {task} />
    {/each}
  </div>
</div>
