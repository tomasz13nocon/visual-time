<script lang="ts">
  import type { Dayjs } from "dayjs";
  import dayjs from "$lib/dayjs";

  const format = "YYYY-MM-DD";

  export let date: Dayjs;
  let dateStr = date.format(format);

  const toStr = (x: Dayjs) => (dateStr = dayjs(x).format(format));
  const fromStr = (x: string) => (date = dayjs(x, format));

  $: toStr(date);
  $: fromStr(dateStr);
</script>

<input type="date" class="" bind:value={dateStr} />
