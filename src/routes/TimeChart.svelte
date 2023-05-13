<script lang="ts">
  import { Task, taskDraft, tracker } from "./task";
  import { fromMs, fromPos, rInner, rOuter } from "./chart";
  import TaskArc from "./TaskArc.svelte";
  import ChartBase from "./ChartBase.svelte";
  import BulletText from "./BulletText.svelte";
  import dayjs from "$lib/dayjs";

  let tasks = tracker.tasks;
  let hovered: Task | null = null;
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

  {#each [...$tasks].reverse() as task}
    <TaskArc
      {task}
      on:mouseenter={() => {
        hovered = task;
        task.hovered = true;
      }}
      on:mouseleave={() => {
        hovered = null;
        task.hovered = false;
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
    {@const startDate = dayjs(hovered.startDate)}
    {@const endDate = dayjs(hovered.endDate)}
    {@const diff = endDate.diff(startDate, "minute")}

    <TaskArc task={hovered} outline fat />

    <text>
      {fromMs(hovered.startDate).time.toFixed(2)}
    </text>

    <!-- title on circle -->
    {@const taskCenter = fromMs(hovered.startDate + (hovered.endDate - hovered.startDate) / 2)}
    <BulletText
      x={taskCenter.toPosX(rOuter - (rOuter - rInner) / 2)}
      y={taskCenter.toPosY(rOuter - (rOuter - rInner) / 2)}
      color={hovered.color}
    >
      {hovered.name}
    </BulletText>

    <!-- center info -->
    <g text-anchor="middle" dominant-baseline="middle" transform="translate(0, -70)">
      <text text-anchor="middle" dominant-baseline="middle" class="text-xl font-light">
        {hovered.name}
      </text>
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        transform="translate(0, 30)"
        class="text-sm"
      >
        🕓
        {#if diff > 60}
          {Math.floor(diff / 60)} hour{Math.floor(diff / 60) === 1 ? "" : "s"},{" "}
        {/if}
        {diff % 60} minute{diff % 60 === 1 ? "" : "s"}
      </text>
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        transform="translate(0, 50)"
        class="text-sm"
      >
        {#if hovered.active}
          ⌛ Ongoing
        {:else}
          ✅ Finished {endDate.fromNow()}
        {/if}
      </text>
    </g>

    <!-- start and end times -->
    {@const startTimePos = fromMs(hovered.startDate - 1000 * 60 * 5)}
    {@const endTimePos = fromMs(hovered.endDate + 1000 * 60 * 5)}
    <text
      class="text-xs font-extralight"
      x={startTimePos.toPosX(rOuter + 18)}
      y={startTimePos.toPosY(rOuter + 18)}
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {startDate.format("H:mm")}
    </text>
    <text
      class="text-xs font-extralight"
      x={endTimePos.toPosX(rOuter + 18)}
      y={endTimePos.toPosY(rOuter + 18)}
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {#if hovered.active}
        now
      {:else}
        {endDate.format("H:mm")}
      {/if}
    </text>
  {/if}
</svg>
