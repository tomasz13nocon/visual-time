<script lang="ts">
  import type { Writable } from "svelte/store";
  import { colors, tracker, type Task } from "./task";
  import dayjs from "$lib/dayjs";
  import IconButton from "$lib/components/IconButton.svelte";
  import ColorButton from "./ColorButton.svelte";
  import { clickOutside } from "$lib/clickOutside";
  import Icon from "@iconify/svelte";
  import Tag from "$lib/components/Tag.svelte";

  export let task: Writable<Task>;

  let editingName = false;
  let editingColor = false;
  let nameInput: HTMLInputElement;
  let colorEditButton: HTMLButtonElement;
  let prevName = "";

  function startEditingName() {
    editingName = true;
    prevName = $task.name;
  }
  function commitNameEdit() {
    if (!editingName) return;
    editingName = false;
    if (!$task.name.trim()) {
      $task.name = prevName;
      return;
    }
    if ($task.name !== prevName) {
      tracker.updateTask($task);
    }
  }
  function cancelNameEdit() {
    if (!editingName) return;
    editingName = false;
    $task.name = prevName;
  }

  $: diff = dayjs($task.endDate).diff(dayjs($task.startDate), "minute");
</script>

<div class="text-center absolute top-[calc(50%-100px)] mx-auto inset-x-0 w-fit">
  {#if editingName}
    <input
      class="input"
      type="text"
      autofocus
      bind:value={$task.name}
      bind:this={nameInput}
      on:blur={cancelNameEdit}
      on:keydown={(e) => {
        if (e.key === "Escape") cancelNameEdit();
        if (e.key === "Enter") commitNameEdit();
      }}
    />
  {:else}
    <h3 class="font-light">
      {$task.name}
    </h3>
  {/if}

  <div class="mt-1 flex gap-1 justify-center">
    {#each $task.tags as tag}
      <Tag {tag} />
    {/each}
  </div>

  <div class="flex gap-1 justify-center mb-4 mt-2">
    <IconButton icon="eva:edit-fill" medium on:click={startEditingName} title="Change name" />
    <IconButton
      icon="eva:color-palette-fill"
      medium
      bind:element={colorEditButton}
      on:click={() => {
        editingColor = !editingColor;
      }}
      title="Change color"
    />
    <IconButton
      icon="eva:clock-fill"
      medium
      bind:element={colorEditButton}
      on:click={() => {
        editingColor = !editingColor;
      }}
      title="Change color"
    />
    <IconButton
      icon="eva:trash-2-outline"
      medium
      on:click={() => tracker.removeTask($task)}
      title="Remove task entry"
    />
    {#if editingColor}
      <div
        class="absolute grid grid-cols-[repeat(8,2rem)] gap-1 top-20 card p-2"
        use:clickOutside={colorEditButton}
        on:clickOutside={() => (editingColor = false)}
      >
        {#each colors as { color, label }}
          <ColorButton
            {color}
            ariaLabel={label}
            selected={$task.color === color}
            small
            on:click={() => {
              $task.color = color;
              tracker.updateTask($task);
              editingColor = false;
            }}
          />
        {/each}
      </div>
    {/if}
  </div>

  <div class="text-sm">
    🕓
    {#if diff >= 60}
      {Math.floor(diff / 60)} hour{Math.floor(diff / 60) === 1 ? "" : "s"},{" "}
    {/if}
    {diff % 60} minute{diff % 60 === 1 ? "" : "s"}
  </div>
  <div class="text-sm">
    {#if $task.active}
      ⌛ Ongoing
    {:else}
      ✅ Finished {dayjs($task.endDate).fromNow()}
    {/if}
  </div>
</div>
