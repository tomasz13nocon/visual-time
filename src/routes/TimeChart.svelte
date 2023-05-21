<script lang="ts">
  import { Task, createTaskDraft, taskDraft, tracker } from "./task";
  import { fromPos, rInner, rOuter } from "./chart";
  import TaskArc from "./TaskArc.svelte";
  import ChartBase from "./ChartBase.svelte";
  import { get, type Writable } from "svelte/store";
  import HoverElements from "./HoverElements.svelte";
  import OverflowBullets from "./OverflowBullets.svelte";
  import { selectedDateStart } from "$lib/stores";
  import { getContext, onMount } from "svelte";
  import CenterTask from "./CenterTask.svelte";

  let tasks = tracker.tasks;
  let hovered: Writable<Writable<Task> | null> = getContext("hovered");
  let selected = false;
  let svgEl: SVGSVGElement;
  let mousePos: DOMPoint;
  let pt: DOMPoint;
  let drawing = false;
  let drawingPivot = 0;
  let baseHovered = false;
  let resizingStart: Writable<Task> | null = null;
  let resizingEnd: Writable<Task> | null = null;

  onMount(() => {
    // make sure it's always defined to avoid bugs
    mousePos = new DOMPoint(0, 0);
    pt = svgEl.createSVGPoint();
  });

  tasks.subscribe(() => {
    $hovered = null;
    selected = false;
  });

  // $: if ($hovered === null) selected = false;

  function mouseMoved(e: MouseEvent) {
    pt.x = e.clientX;
    pt.y = e.clientY;
    mousePos = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());

    if (drawing) {
      const newValue = fromPos(mousePos.x, mousePos.y, $selectedDateStart)
        .snapToGridOrTasks($tasks.map((taskStore) => get(taskStore)))
        .toMs();
      if (drawingPivot <= newValue) {
        $taskDraft.startDate = drawingPivot;
        $taskDraft.endDate = newValue;
      }
      if (drawingPivot >= newValue) {
        $taskDraft.endDate = drawingPivot;
        $taskDraft.startDate = newValue;
      }
    }
    if (resizingStart) {
      const newValue = fromPos(mousePos.x, mousePos.y, $selectedDateStart)
        .snapToGridOrTasks($tasks.map((taskStore) => get(taskStore)))
        .toMs();
      if (newValue > $resizingStart.endDate) {
        $resizingStart.startDate = $resizingStart.endDate;
        $resizingStart.endDate = newValue;
        resizingEnd = resizingStart;
        resizingStart = null;
      } else {
        $resizingStart.startDate = newValue;
      }
    }
    if (resizingEnd) {
      const newValue = fromPos(mousePos.x, mousePos.y, $selectedDateStart)
        .snapToGridOrTasks($tasks.map((taskStore) => get(taskStore)))
        .toMs();
      if (newValue < $resizingEnd.startDate) {
        $resizingEnd.endDate = $resizingEnd.startDate;
        $resizingEnd.startDate = newValue;
        resizingStart = resizingEnd;
        resizingEnd = null;
      } else {
        $resizingEnd.endDate = newValue;
      }
    }
  }

  function mouseUp() {
    if (drawing) {
      drawing = false;
      if ($taskDraft.endDate - $taskDraft.startDate !== 0) {
        tracker.addTask($taskDraft);
        $taskDraft = createTaskDraft($taskDraft);
      }
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<svg
  viewBox="-400 -400 800 800"
  height="100%"
  width="100%"
  class="mx-auto fill-token"
  bind:this={svgEl}
  on:click={() => {
    if (resizingStart) {
      if ($resizingStart.endDate - $resizingStart.startDate === 0) {
        tracker.removeTask($resizingStart);
      } else {
        tracker.updateTask($resizingStart);
      }
      resizingStart = null;
    } else if (resizingEnd) {
      if ($resizingEnd.endDate - $resizingEnd.startDate === 0) {
        tracker.removeTask($resizingEnd);
      } else {
        tracker.updateTask($resizingEnd);
      }
      resizingEnd = null;
    } else if (selected) {
      selected = false;
      $hovered = null;
    }
  }}
  on:mousemove={mouseMoved}
  on:mouseup={mouseUp}
>
  <ChartBase
    on:mouseenter={() => (baseHovered = true)}
    on:mouseleave={() => (baseHovered = false)}
    on:mousedown={() => {
      drawing = true;
      if (mousePos) {
        const start = fromPos(mousePos.x, mousePos.y, $selectedDateStart)
          .snapToGridOrTasks($tasks.map((taskStore) => get(taskStore)))
          .toMs();
        $taskDraft.startDate = start;
        $taskDraft.endDate = start;
        drawingPivot = start;
      }
    }}
  />

  {#each [...$tasks].reverse() as task}
    <TaskArc
      {task}
      on:mouseenter={() => {
        if (!selected) $hovered = task;
      }}
      on:mouseleave={() => {
        if (!selected) $hovered = null;
      }}
      on:click={(e) => {
        e.stopPropagation();
        if (selected && $hovered === task) {
          selected = false;
        } else {
          $hovered = task;
          selected = true;
        }
      }}
    />
  {/each}

  <!-- line "cursor" -->
  {#if baseHovered && !drawing && !resizingStart && !resizingEnd}
    <path
      d="M0 {-rInner} V {-rOuter}"
      transform="rotate({fromPos(mousePos.x, mousePos.y, $selectedDateStart)
        .snapToGridOrTasks($tasks.map((taskStore) => get(taskStore)))
        .toDeg()})"
      stroke-width="2"
      stroke={$taskDraft.color}
      class="pointer-events-none"
    />
  {/if}

  {#if drawing}
    <TaskArc task={taskDraft} pointerEventsNone fat dashArray />
  {/if}

  {#if $hovered}
    <HoverElements task={$hovered} {selected} {mousePos} bind:resizingStart bind:resizingEnd />
  {/if}

  {#each $tasks as task}
    <OverflowBullets {task} />
  {/each}
</svg>

{#if $hovered}
  <CenterTask task={$hovered} {selected} />
{/if}
