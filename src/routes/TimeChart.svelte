<script lang="ts">
  import { Task, createTaskDraft, taskDraft, tracker } from "./task";
  import { fromPos, rInner, rOuter } from "./chart";
  import TaskArc from "./TaskArc.svelte";
  import ChartBase from "./ChartBase.svelte";
  import type { Writable } from "svelte/store";
  import HoverElements from "./HoverElements.svelte";
  import OverflowBullets from "./OverflowBullets.svelte";
  import { selectedDateStart, user } from "$lib/stores";

  let tasks = tracker.tasks;
  let hovered: Writable<Task> | null = null;
  let svgEl: SVGSVGElement;
  let mousePos: DOMPoint | null = null;
  let drawing = false;
  let drawingPivot = 0;

  // TODO snap to tasks

  function mouseMoved(e: MouseEvent) {
    let pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    mousePos = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());

    if (drawing) {
      const newValue = $selectedDateStart
        .add(fromPos(mousePos.x, mousePos.y).snapToGrid().toMs(), "ms")
        .valueOf();
      if (drawingPivot <= newValue) {
        $taskDraft.endDate = newValue;
      }
      if (drawingPivot >= newValue) {
        $taskDraft.startDate = newValue;
      }
    }
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
      drawing = true;
      if (mousePos) {
        const start = $selectedDateStart
          .add(fromPos(mousePos.x, mousePos.y).snapToGrid().toMs(), "ms")
          .valueOf();
        $taskDraft.startDate = start;
        $taskDraft.endDate = start;
        drawingPivot = start;
      }
    }}
    on:mouseup={() => {
      drawing = false;
      tracker.addTask($taskDraft);
      $taskDraft = createTaskDraft($taskDraft);
    }}
  />

  {#each [...$tasks].reverse() as task}
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

  <!-- line "cursor" -->
  {#if mousePos && !drawing}
    <path
      d="M0 {-rInner} V {-rOuter}"
      transform="rotate({fromPos(mousePos.x, mousePos.y).snapToGrid().toDeg()})"
      stroke-width="2"
      stroke={$taskDraft.color}
      class="pointer-events-none"
    />
  {/if}

  <!-- arc being drawn -->
  {#if drawing}
    <TaskArc task={taskDraft} pointerEventsNone fat dashArray />
  {/if}

  {#if hovered}
    <HoverElements task={hovered} />
  {/if}

  {#each $tasks as task}
    <OverflowBullets {task} />
  {/each}
</svg>
