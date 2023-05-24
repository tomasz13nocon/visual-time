<script lang="ts">
  import type { Task } from "./task";
  import { fromMs, rInner, rOuter } from "./chart";
  import type { Writable } from "svelte/store";
  import { clampEnd, clampStart } from "$lib/util";
  import { scale } from "svelte/transition";
  import { selectedDate } from "$lib/stores";
  import dayjs from "$lib/dayjs";

  export let task: Writable<Task>;
  export let outline = false;
  export let fat = false;
  export let pointerEventsNone = false;
  export let dashArray = false;
  export let fatter = false;
  export let transition = false;

  // When a task overlaps midnight, and we change selected date
  // we get 2 tasks with teh same id despite being different entities for the purposes of rendering
  // causing transitions to not work.
  // That's why we "salt" html IDs with the selected date at the time of first render (not reactive on purpose)
  let displayedInDate = $selectedDate;

  $: startT = fromMs(clampStart($task.startDate));
  $: endT = fromMs(clampEnd($task.endDate));
  $: short = endT.toDeg() - startT.toDeg() < 0.5;
  $: largeArc = endT.toDeg() - startT.toDeg() > 180 ? 1 : 0;
</script>

<defs>
  <path
    id="task-path-{$task.id + displayedInDate.valueOf()}"
    d="M {startT.toPosStr(rOuter)}
    A {rOuter} {rOuter} 0 {largeArc} 1 {endT.toPosStr(rOuter)}
    L {endT.toPosStr(rInner)}
    A {rInner} {rInner} 0 {largeArc} 0 {startT.toPosStr(rInner)} Z"
  />
  <clipPath id="task-clip-{$task.id + displayedInDate.valueOf()}">
    <use href="#task-path-{$task.id + displayedInDate.valueOf()}" />
  </clipPath>
</defs>

<!-- {#if dayjs($task.startDate).isSame($selectedDate, "day") || dayjs($task.endDate).isSame($selectedDate, "day")} -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<use
  href="#task-path-{$task.id + displayedInDate.valueOf()}"
  clip-path={short ? "" : `url(#task-clip-${$task.id + displayedInDate.valueOf()})`}
  stroke={$task.color}
  stroke-width={fatter ? 6 : fat && !short ? 4 : 2}
  stroke-dasharray={dashArray ? "4 4" : ""}
  fill={outline ? "none" : $task.color + "44"}
  class="cursor-pointer"
  class:pointer-events-none={outline || pointerEventsNone}
  on:mouseenter
  on:mouseleave
  on:click
/>
<!-- transition:scale={{ duration: transition ? 350 : 0 }} -->
<!-- {/if} -->
