<script lang="ts">
  import "@skeletonlabs/skeleton/themes/theme-crimson.css";
  import "@skeletonlabs/skeleton/styles/all.css";
  import "../app.postcss";
  import { AppShell, AppBar, LightSwitch, TabGroup, Tab } from "@skeletonlabs/skeleton";
  import Controls from "./Controls.svelte";

  let tabSet = 0;
</script>

<AppShell slotPageContent="h-full w-full">
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <span class="text-lg uppercase tracking-wider">track<strong>every</strong>.thing</span>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <LightSwitch />
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <svelte:fragment slot="sidebarLeft">
    <div class="w-96 border-r-2 border-surface-700 h-full">
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
    </div>
  </svelte:fragment>
  <slot />
</AppShell>
