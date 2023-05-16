<script lang="ts">
  import DatePicker from "$lib/components/DatePicker.svelte";
  import IconButton from "$lib/components/IconButton.svelte";
  import TimeChart from "./TimeChart.svelte";
  import { selectedDate } from "$lib/stores";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import Controls from "./Controls.svelte";
  import Icon from "@iconify/svelte";

  let tabSet = 0;
</script>

<div class="flex w-full h-full">
  <aside class="w-96 border-r-2 border-surface-700 h-full">
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
          a planner TODO
        {/if}
      </svelte:fragment>
    </TabGroup>
  </aside>

  <section class="mx-auto w-full h-full p-4 box-border">
    <div class="flex absolute input-group w-auto">
      <button
        class="variant-soft-primary !px-1"
        on:click={() => ($selectedDate = $selectedDate.subtract(1, "day"))}
      >
        <Icon icon="eva:arrow-left-fill" class="h-full w-8" />
      </button>
      <DatePicker bind:date={$selectedDate} />
      <button
        class="variant-soft-primary !px-1"
        on:click={() => ($selectedDate = $selectedDate.add(1, "day"))}
      >
        <Icon icon="eva:arrow-right-fill" class="h-full w-8" />
      </button>
    </div>
    <TimeChart />
  </section>
</div>
