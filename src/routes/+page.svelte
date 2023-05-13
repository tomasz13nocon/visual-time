<script lang="ts">
  import DatePicker from "$lib/components/DatePicker.svelte";
  import IconButton from "$lib/components/IconButton.svelte";
  import TimeChart from "./TimeChart.svelte";
  import { selectedDate } from "$lib/stores";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import Controls from "./Controls.svelte";

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
    <div class="flex gap-2 absolute">
      <IconButton
        small
        icon="eva:arrow-left-fill"
        on:click={() => ($selectedDate = $selectedDate.subtract(1, "day"))}
      />
      <DatePicker bind:date={$selectedDate} />
      <IconButton
        small
        icon="eva:arrow-right-fill"
        on:click={() => ($selectedDate = $selectedDate.add(1, "day"))}
      />
    </div>
    <TimeChart />
  </section>
</div>
