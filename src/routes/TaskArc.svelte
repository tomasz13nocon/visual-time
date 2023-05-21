<script lang="ts">
  import type { Task } from "./task";
  import { fromMs, rInner, rOuter } from "./chart";
  import type { Writable } from "svelte/store";
  import { clampEnd, clampStart } from "$lib/util";

  export let task: Writable<Task>;
  export let outline = false;
  export let fat = false;
  export let pointerEventsNone = false;
  export let dashArray = false;
  export let fatter = false;

  $: startT = fromMs(clampStart($task.startDate));
  $: endT = fromMs(clampEnd($task.endDate));
  $: short = endT.toDeg() - startT.toDeg() < 0.5;
  $: largeArc = endT.toDeg() - startT.toDeg() > 180 ? 1 : 0;
</script>

<defs>
  <path
    id="task-path-{$task.id}"
    d="M {startT.toPosStr(rOuter)}
    A {rOuter} {rOuter} 0 {largeArc} 1 {endT.toPosStr(rOuter)}
    L {endT.toPosStr(rInner)}
    A {rInner} {rInner} 0 {largeArc} 0 {startT.toPosStr(rInner)} Z"
  />
  <clipPath id="task-clip-{$task.id}">
    <use href="#task-path-{$task.id}" />
  </clipPath>
</defs>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<use
  href="#task-path-{$task.id}"
  clip-path={short ? "" : `url(#task-clip-${$task.id})`}
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