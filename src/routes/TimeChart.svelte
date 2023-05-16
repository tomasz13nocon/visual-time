<script lang="ts">
  import { Task, taskDraft, tracker } from "./task";
  import { fromPos, rInner, rOuter } from "./chart";
  import TaskArc from "./TaskArc.svelte";
  import ChartBase from "./ChartBase.svelte";
  import dayjs from "$lib/dayjs";
  import type { Writable } from "svelte/store";
  import HoverElements from "./HoverElements.svelte";

  let tasks = tracker.tasks;
  let hovered: Writable<Task> | null = null;
  let svgEl: SVGSVGElement;
  let mousePos: DOMPoint | null = null;

  // TODO snap to tasks

  function mouseMoved(e: MouseEvent) {
    let pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    mousePos = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
  }
</script>

<svg
  viewBox="-400 -400 800 800"
  height="100%"
  width="100%"
  class="mx-auto fill-token"
  bind:this={svgEl}
>
  <ChartBase
    on:mousemove={mouseMoved}
    on:mouseleave={() => (mousePos = null)}
    on:mousedown={() => {
      // TODO sometimes we get 59:59 instead of 00:00
      if (mousePos) {
        $taskDraft.startDate = fromPos(mousePos.x, mousePos.y).snapToGrid().toMs();
        console.log(dayjs($taskDraft.startDate).format());
      }
    }}
  />

  {#each $tasks as task}
    <TaskArc
      {task}
      on:mouseenter={() => {
        hovered = task;
        task.update((t) => {
          t.hovered = true;
          return t;
        });
      }}
      on:mouseleave={() => {
        hovered = null;
        task.update((t) => {
          t.hovered = false;
          return t;
        });
      }}
    />
  {/each}

  {#if mousePos}
    <path
      d="M0 {-rInner} V {-rOuter}"
      transform="rotate({fromPos(mousePos.x, mousePos.y).snapToGrid().toDeg()})"
      stroke-width="2"
      stroke={$taskDraft.color}
      class="pointer-events-none"
    />
  {/if}

  {#if hovered}
    <HoverElements task={hovered} />
  {/if}
</svg>
