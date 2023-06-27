<script lang="ts">
  import { InputChip } from "@skeletonlabs/skeleton";
  import { taskDraft, type TagTemplate, fetchTagTemplates } from "./task";
  import { createCombobox, type ComboboxValue } from "sveltimate";
  import { writable } from "svelte/store";
  import { user } from "$lib/stores";
  import Tag from "$lib/components/Tag.svelte";

  const tagTemplates = writable<(TagTemplate & ComboboxValue & { add?: boolean })[]>([]);

  async function getTemplates() {
    if ($tagTemplates.length) {
      return;
    }
    $tagTemplates = (await fetchTagTemplates($user)).map((t) => ({
      ...t,
      value: t.name,
    }));
  }

  const { listboxVisible, focusedValue, filteredValues, inputValue, input, item, listbox } =
    createCombobox(tagTemplates, {
      onSelection: (value) => {
        $taskDraft.tags = [...$taskDraft.tags, { name: value.value }];
        $inputValue = "";
      },
    });

  $: if ($inputValue && !$filteredValues.find((t) => t.name === $inputValue || t.add)) {
    $filteredValues = [...$filteredValues, { name: $inputValue, value: $inputValue, add: true }];
  }

  // function addTag() {
  //   $taskDraft.tags = [...$taskDraft.tags, { name: tagName }];
  //   tagName = "";
  // }
</script>

<div class="relative">
  {#each $taskDraft.tags as tag}
    <Tag {tag} />
  {/each}
  <input
    use:input
    class="input px-3 py-1"
    type="text"
    placeholder="Tags (press enter to accept)"
    on:focus={getTemplates}
  />
  {#if listboxVisible}
    <div
      use:listbox
      class="absolute top-full bg-surface-50-900-token z-10 py-1 drop-shadow-lg max-h-80 overflow-y-auto rounded"
    >
      <ul class="flex flex-col">
        {#each $filteredValues as value}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            use:item={value}
            class="cursor-pointer px-3 py-1
            {$focusedValue === value
              ? 'bg-secondary-300/50 dark:bg-secondary-900/75 outline-secondary-500 outline-2 -outline-offset-2 outline'
              : ''}"
          >
            {value.add ? "Add " : ""}<Tag tag={value} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
