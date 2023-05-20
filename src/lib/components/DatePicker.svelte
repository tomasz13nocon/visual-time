<script lang="ts">
  import type { Dayjs } from "dayjs";
  import dayjs from "$lib/dayjs";
  import { selectedDate, selectedDateStart } from "$lib/stores";

  export let date: Dayjs;

  const format = "YYYY-MM-DD";
  let dateStr = date.format(format);

  const toStr = (date: Dayjs) => (dateStr = date.format(format));
  const fromStr = (str: string) => (date = dayjs(str, format));

  $: toStr(date);
  $: diff = $selectedDateStart.diff(dayjs().startOf("day"), "day");

  function dateChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    fromStr(target.value);
  }
</script>

<input
  type="date"
  class="input w-52 {$$props.class}"
  bind:value={dateStr}
  on:change={dateChanged}
/>
<div class="relative">
  <div class="absolute right-10 top-3 text-sm">
    {diff === 0
      ? "Today"
      : diff === 1
      ? "Tomorrow"
      : diff === -1
      ? "Yesterday"
      : date.format("ddd")}
  </div>
</div>
