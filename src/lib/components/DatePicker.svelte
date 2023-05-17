<script lang="ts">
  import type { Dayjs } from "dayjs";
  import dayjs from "$lib/dayjs";

  export let date: Dayjs;

  const format = "YYYY-MM-DD";
  let dateStr = date.format(format);

  const toStr = (date: Dayjs) => (dateStr = date.format(format));
  const fromStr = (str: string) => (date = dayjs(str, format));

  $: toStr(date);

  function dateChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    fromStr(target.value);
  }
</script>

<input type="date" class="input" bind:value={dateStr} on:change={dateChanged} />
