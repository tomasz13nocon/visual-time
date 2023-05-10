<script lang="ts">
  import type { Task } from "./task";
  import { atop, getTaskInfo, rInner, rOuter } from "./chart";

  export let task: Task;
  export let hovered: Task | null = null;

  const { startDeg, endDeg } = getTaskInfo(task);
</script>

<path
  d="M {atop(startDeg, rInner)}
         L {atop(startDeg, rOuter)}
         A {rOuter} {rOuter} 0 0 1 {atop(endDeg, rOuter)} L {atop(endDeg, rInner)}
         A {rInner} {rInner} 0 0 0 {atop(startDeg, rInner)}"
  stroke={task.color}
  fill={task.color + "44"}
  class="cursor-pointer"
  on:mouseenter={() => {
    hovered = task;
    task.hovered = true;
  }}
  on:mouseleave={() => {
    hovered = null;
    task.hovered = false;
  }}
/>
