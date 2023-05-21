<script lang="ts">
  import DatePicker from "$lib/components/DatePicker.svelte";
  import TimeChart from "./TimeChart.svelte";
  import { selectedDate } from "$lib/stores";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import Controls from "./Controls.svelte";
  import IconButton from "$lib/components/IconButton.svelte";
  import type { Task } from "./task";
  import { writable, type Writable } from "svelte/store";
  import { setContext } from "svelte";

  let tabSet = 0;
  let hovered: Writable<Writable<Task> | null> = setContext("hovered", writable(null));
</script>

<div class="flex w-full h-full">
  <aside class="w-96 shrink-0 border-r-2 border-surface-700 h-full overflow-y-scroll">
    <TabGroup justify="justify-center">
      <Tab bind:group={tabSet} name="tab1" value={0}>
        <div class="text-2xl">Tracker</div>
      </Tab>
      <Tab bind:group={tabSet} name="tab2" value={1}>
        <div class="text-2xl">Planner</div>
      </Tab>
      <svelte:fragment slot="panel">
        {#if tabSet === 0}
          <Controls />
        {:else if tabSet === 1}
          TODO
        {/if}
      </svelte:fragment>
    </TabGroup>
  </aside>

  <section class="mx-auto w-full h-full p-4 box-border relative">
    <div class="flex absolute w-auto">
      <IconButton
        icon="eva:arrow-ios-back-outline"
        secondary
        class="rounded-e-none border-[1px] border-r-0 border-surface-400-500-token"
        on:click={() => ($selectedDate = $selectedDate.subtract(1, "day"))}
      />
      <DatePicker bind:date={$selectedDate} class="rounded-none border-x-surface-300" />
      <IconButton
        icon="eva:arrow-ios-forward-outline"
        secondary
        class="rounded-s-none border-[1px] border-l-0 border-surface-400-500-token"
        on:click={() => ($selectedDate = $selectedDate.add(1, "day"))}
      />
    </div>

    <TimeChart />
  </section>
</div>
