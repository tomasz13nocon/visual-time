<script lang="ts">
  import type { Task } from "./task";
  import { fromMs, rInner, rOuter } from "./chart";
  import type { Writable } from "svelte/store";

  export let task: Writable<Task>;
  export let outline = false;
  export let fat = false;

  $: startT = fromMs($task.startDate);
  $: endT = fromMs($task.endDate);
  $: short = endT.toDeg() - startT.toDeg() < 0.5;
</script>

<defs>
  <path
    id="task-path-{$task.id}"
    d="M {startT.toPosStr(rInner)}
    L {startT.toPosStr(rOuter)}
    A {rOuter} {rOuter} 0 0 1 {endT.toPosStr(rOuter)} L {endT.toPosStr(rInner)}
    A {rInner} {rInner} 0 0 0 {startT.toPosStr(rInner)} Z"
  />
  <clipPath id="task-clip-{$task.id}">
    <use href="#task-path-{$task.id}" />
  </clipPath>
</defs>

<!-- <path -->
<!--   d="M {degToPosStr(startDeg, rOuter - 150)} -->
<!-- L {degToPosStr(startDeg, rOuter - 130)} -->
<!-- A {rOuter - 130} {rOuter - 130} 0 0 1 {degToPosStr(endDeg, rOuter - 130)} L {degToPosStr(endDeg, rOuter - 150)} -->
<!-- A {rOuter - 150} {rOuter - 150} 0 0 0 {degToPosStr(startDeg, rOuter - 150)} Z" -->
<!--   fill="#0004" -->
<!--   stroke="black" -->
<!-- /> -->

<!-- <text x="-300" y={-200 + Math.random() * 500}> -->
<!--   {startT.toDeg().toFixed(2)} : {endT.toDeg().toFixed(2)} : {( -->
<!--     endT.toDeg() - startT.toDeg() -->
<!--   ).toFixed(2)} : {startT.time.toFixed(2)} : {endT.time.toFixed(2)} -->
<!-- </text> -->
<use
  href="#task-path-{$task.id}"
  clip-path={short ? "" : `url(#task-clip-${$task.id})`}
  stroke={$task.color}
  stroke-width={fat && !short ? 4 : 2}
  fill={outline ? "none" : $task.color + "44"}
  class="cursor-pointer"
  class:pointer-events-none={outline}
  on:mouseenter
  on:mouseleave
/>
