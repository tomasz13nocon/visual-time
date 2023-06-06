<script lang="ts">
  import { fetchTaskTemplates, taskDraft, type TaskTemplate } from "./task";
  import { createCombobox } from "$lib/combobox";
  import TaskName from "./TaskName.svelte";
  import { user } from "$lib/stores";
  import { writable } from "svelte/store";

  export let startTracking: () => void;

  const taskTemplates = writable<(TaskTemplate & { value: string })[]>([]);

  async function getTemplates() {
    if ($taskTemplates.length) {
      return;
    }
    $taskTemplates = (await fetchTaskTemplates($user)).map((t) => ({
      ...t,
      value: t.name,
    }));
  }

  const {
    listboxVisible,
    focusedValue,
    filteredValues,
    comboboxInput,
    comboboxContainer,
    comboboxItem,
  } = createCombobox(taskTemplates, {
    onSelection: (value) => {
      $taskDraft.color = value.color;
      $taskDraft.name = value.name;
    },
  });
</script>

<div use:comboboxContainer class="relative">
  <label class="label relative">
    <input
      use:comboboxInput
      class="input pr-8"
      type="text"
      placeholder="What are you working on?"
      bind:value={$taskDraft.name}
      on:keydown={(e) => {
        if (e.key === "Enter" && !$listboxVisible) {
          startTracking();
        }
      }}
      on:focus={getTemplates}
    />
  </label>
  {#if $listboxVisible && $filteredValues.length}
    <div
      class="absolute top-full bg-surface-50-900-token z-10 py-1 drop-shadow-lg max-h-80 overflow-y-auto rounded card"
    >
      <div class="text-sm px-2 py-1">Recently tracked:</div>
      <ul class="">
        {#each $filteredValues as value}
          <li
            use:comboboxItem={value}
            class="cursor-pointer px-3 py-1 hover:bg-secondary-300/50 hover:dark:bg-secondary-900/75
                {$focusedValue === value
              ? 'bg-secondary-300/50 dark:bg-secondary-900/75 outline-secondary-500 outline-2 -outline-offset-2 outline'
              : ''}"
          >
            <TaskName task={value} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
