<script lang="ts">
  import { fetchTaskTemplates, taskDraft, type TaskTemplate } from "./task";
  import { createCombobox, type ComboboxValue } from "sveltimate";
  import TaskName from "./TaskName.svelte";
  import { user } from "$lib/stores";
  import { writable } from "svelte/store";

  export let startTracking: () => void;

  const taskTemplates = writable<(TaskTemplate & ComboboxValue)[]>([]);

  async function getTemplates() {
    if ($taskTemplates.length) {
      return;
    }
    $taskTemplates = (await fetchTaskTemplates($user)).map((t) => ({
      ...t,
      value: t.name,
      key: t.name + t.color,
    }));
  }

  const {
    listboxVisible,
    focusedValue,
    filteredValues,
    inputValue,
    listboxX,
    listboxY,
    input,
    listbox,
    item,
  } = createCombobox(taskTemplates, {
    onSelection: (value) => {
      $taskDraft.color = value.color;
      $taskDraft.name = value.name;
    },
    showOnFocus: true,
  });

  // $: $taskDraft.name = $inputValue;
</script>

<div class="">
  <input
    use:input
    aria-label="Task name"
    class="input pr-8"
    type="text"
    placeholder="What are you working on?"
    bind:value={$taskDraft.name}
    on:focus={getTemplates}
    on:keydown|capture={(e) => {
      if (e.key === "Enter" && !$focusedValue) {
        startTracking();
      }
    }}
  />
  {#if $listboxVisible}
    <div
      use:listbox
      class="absolute top-0 left-0 border-[1px] border-surface-900-50-token bg-surface-50-900-token z-10 py-1 drop-shadow-lg max-h-80 overflow-y-auto rounded-md card"
      style:translate="{$listboxX | 0}px {$listboxY | 0}px"
    >
      <div class="text-sm px-2 py-1">Recently tracked:</div>
      <ul class="">
        {#each $filteredValues as value}
          <li
            use:item={value}
            class="cursor-pointer px-3 py-1 active:border-2 border-primary-500
                {$focusedValue === value ? 'bg-secondary-300/50 dark:bg-secondary-900/75' : ''}"
          >
            <TaskName task={value} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
