<script lang="ts">
  import { taskDraft, type TagTemplate, fetchTagTemplates } from "./task";
  import { createCombobox, type ComboboxValue } from "sveltimate";
  import { writable } from "svelte/store";
  import { user } from "$lib/stores";
  import Tag from "$lib/components/Tag.svelte";
  import autoAnimate from "@formkit/auto-animate";
  import Icon from "@iconify/svelte";

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

  const {
    listboxVisible,
    focusedValue,
    filteredValues,
    inputValue,
    listboxX,
    listboxY,
    input,
    item,
    listbox,
  } = createCombobox(tagTemplates, {
    showOnFocus: true,
    onSelection: (value) => {
      // console.log(value);
      addTag(value.value);
      $listboxVisible = true;
    },
  });

  // $: if ($inputValue && !$filteredValues.find((t) => t.name === $inputValue || t.add)) {
  //   $filteredValues = [...$filteredValues, { name: $inputValue, value: $inputValue, add: true }];
  // }

  function addTag(name: string) {
    $taskDraft.tags = [...$taskDraft.tags, { name: name }];
    // $tagTemplates = $tagTemplates.filter((t) => t.value !== name);
    $inputValue = "";
  }
</script>

<div class="relative">
  <div class="flex flex-wrap gap-1 mb-1">
    {#each $taskDraft.tags as tag}
      <Tag
        {tag}
        button
        on:click={() => {
          const i = $taskDraft.tags.indexOf(tag);
          if (i === -1) {
            return;
          }
          $taskDraft.tags.splice(i, 1);
          $taskDraft.tags = $taskDraft.tags;
        }}
      />
    {/each}
  </div>
  <input
    use:input
    aria-label="Tags"
    class="input px-3 py-1"
    type="text"
    placeholder="Tags (press enter to accept)"
    on:focus={getTemplates}
    on:keydown|capture={(e) => {
      if (e.key === "Enter" && !$focusedValue) {
        addTag($inputValue);
      }
    }}
  />
  {#if $listboxVisible}
    <div
      use:listbox
      class="absolute top-0 left-0 border-[1px] border-surface-900-50-token bg-surface-50-900-token z-10 py-1 drop-shadow-lg max-h-80 overflow-y-auto rounded-md card"
      style:translate="{$listboxX | 0}px {$listboxY | 0}px"
    >
      <ul class="flex flex-col">
        {#each $filteredValues as value}
          <li
            use:item={value}
            class="cursor-pointer px-3 py-1
            {$focusedValue === value ? 'bg-secondary-300/50 dark:bg-secondary-900/75' : ''}"
          >
            {value.add ? "Add " : ""}<Tag tag={value} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
