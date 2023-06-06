<script lang="ts">
  export let task: { name: string; color: string };
</script>

<div class="bg-surface-50-900-token rounded-md w-fit">
  <div
    class="px-2 rounded-md border-2 break-words"
    style:background-color={task.color + "22"}
    style:border-color={task.color}
  >
    {task.name}
  </div>
</div>
