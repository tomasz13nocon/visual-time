<script lang="ts">
  import Icon from "@iconify/svelte";
  import TaskListing from "./TaskListing.svelte";
  import { onDestroy, onMount } from "svelte";
  import dayjs from "dayjs";
  import customParseFormat from "dayjs/plugin/customParseFormat";
  import { Task, tracker, colors } from "./Task";
  import IconButton from "$lib/IconButton.svelte";

  dayjs.extend(customParseFormat);

  let taskDraft = new Task();

  // onMount(startTimer);
  // onDestroy(stopTimer);

  let from = "";
  let to = "";
</script>

<aside class="w-96 border-r-2 border-surface-700 h-full p-2 flex flex-col gap-4">
  <h2 class="py-2 text-center">Controls</h2>

  <div class="flex gap-2 items-center">
    <label class="label">
      <input class="input py-1 px-3" type="text" placeholder="Task" bind:value={taskDraft.name} />
    </label>
    <IconButton
      icon="eva:arrow-right-fill"
      on:click={() => {
        $tracker.start(taskDraft);
        taskDraft = new Task();
      }}
    />
    <IconButton
      icon="eva:plus-fill"
      on:click={() =>
        $tracker.addTask({
          ...taskDraft,
          startTime: dayjs(from, "H:m").valueOf(),
          endTime: dayjs(to, "H:m").valueOf(),
        })}
    />
  </div>

  <div class="flex gap-2">
    <input class="input px-3" type="time" bind:value={from} />
    <input class="input px-3" type="time" bind:value={to} />
  </div>

  <div class="flex gap-1">
    {#each colors as color}
      <button
        class="btn-icon {taskDraft.color === color ? 'ring-2 ring-tertiary-600' : ''}"
        style:background-color={color}
        on:click={() => {
          taskDraft.color = color;
        }}
      />
    {/each}
  </div>

  <div class="flex flex-col gap-2">
    {#each $tracker.tasks as task}
      <TaskListing {task} />
    {/each}
  </div>
</aside>
