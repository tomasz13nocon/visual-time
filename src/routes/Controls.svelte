<script lang="ts">
  import TaskListing from "./TaskListing.svelte";
  import { Task, taskDraft, tracker, colors } from "./task";
  import IconButton from "$lib/components/IconButton.svelte";
  import dayjs from "$lib/dayjs";

  let from = "";
  let to = "";

  let tasks = tracker.tasks;

  // TODO remove
  // let idSet = new Set();
  // for (let task of tasks) {
  //   if (idSet.has(task.id)) console.error("Duplicate task id: ", task.id, " for task: ", task.name);
  //   else idSet.add(task.id);
  // }
</script>

<div class="p-2 flex flex-col gap-4">
  <div class="flex gap-2 items-center">
    <label class="label">
      <input class="input py-1 px-3" type="text" placeholder="Task" bind:value={$taskDraft.name} />
    </label>

    <IconButton
      icon="eva:arrow-right-fill"
      on:click={() => {
        $taskDraft.startDate = Date.now();
        tracker.addTask($taskDraft, true);

        let oldColor = $taskDraft.color;
        $taskDraft = new Task();
        $taskDraft.color = oldColor;
      }}
    />

    <IconButton
      icon="eva:plus-fill"
      on:click={() =>
        tracker.addTask({
          ...$taskDraft,
          startDate: dayjs(from, "H:m").valueOf(),
          endDate: dayjs(to, "H:m").valueOf(),
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
        class="btn-icon {$taskDraft.color === color ? 'ring-2 ring-surface-900-50-token' : ''}"
        style:background-color={color}
        on:click={() => {
          $taskDraft.color = color;
        }}
      />
    {/each}
  </div>

  <div class="flex flex-col gap-2">
    {#each $tasks as task}
      <TaskListing {task} />
    {/each}
  </div>
</div>
