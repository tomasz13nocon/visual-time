<script lang="ts">
  import { tracker, Task } from "./task";
  import IconButton from "$lib/components/IconButton.svelte";
  import dayjs from "$lib/dayjs";
  import { get, type Writable } from "svelte/store";
  import { user } from "$lib/stores";

  export let task: Writable<Task>;

  $: activeTaskElapsed = $task.endDate - $task.startDate;

  let editing = false;
  $: if (editing && nameInput) nameInput.focus();

  let nameInput: HTMLInputElement;
</script>

<div
  class="-mx-2 -my-1 px-2 py-1 {$task.hovered
    ? 'bg-secondary-300/50 dark:bg-secondary-900/75'
    : ''}"
>
  <div class="flex justify-between gap-2">
    <div class="flex gap-2 items-center">
      {#if editing}
        <input
          class="input"
          type="text"
          bind:value={$task.name}
          bind:this={nameInput}
          on:blur={() => {
            editing = false;
            console.log(get(task));
            get(task).update($user);
          }}
          on:keydown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              editing = false;
            }
          }}
        />
      {:else}
        <div
          class="px-2 rounded-md border-2"
          style:background-color={$task.color + "22"}
          style:border-color={$task.color}
        >
          {$task.name}
        </div>
        <IconButton
          icon="eva:edit-fill"
          small
          on:click={() => {
            editing = true;
          }}
        />
      {/if}
    </div>

    <div class="flex gap-2 items-center">
      {#if $task.active}
        <IconButton icon="eva:square-fill" small on:click={() => tracker.stop()} />
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
          tracker.removeTask($task.id);
        }}
      />
    </div>
  </div>

  <div class="w-fit ml-auto text-sm">
    {dayjs($task.startDate).format("H:mm")}
    -
    {#if !$task.active}
      {dayjs($task.endDate).format("H:mm")}
    {/if}
  </div>
</div>
