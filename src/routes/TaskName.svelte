<script lang="ts">
  import type { Task } from "./task";

  export let task: Task;
</script>

<div class="bg-surface-50-900-token rounded-md">
  <div
    class="px-2 rounded-md border-2"
    style:background-color={task.color + "22"}
    style:border-color={task.color}
  >
    {task.name}
  </div>
</div>
