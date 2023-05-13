import { get, writable, type Writable } from "svelte/store";
import { localStorageStore } from "@skeletonlabs/skeleton";
import { selectedDate } from "$lib/stores";

// prettier-ignore
export const colors = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  // "#14b8a6",
  "#0ea5e9",
  "#8b5cf6",
  "#d946ef",
  "#707070",
  // { bg: "bg-red-500", text: "text-red-500", stroke: "stroke-red-500", fill: "fill-red-500", border: "border-red-500" },
  // { bg: "bg-amber-500", text: "text-amber-500", stroke: "stroke-amber-500", fill: "fill-amber-500", border: "border-amber-500" },
  // { bg: "bg-lime-500", text: "text-lime-500", stroke: "stroke-lime-500", fill: "fill-lime-500", border: "border-lime-500" },
  // { bg: "bg-teal-500", text: "text-teal-500", stroke: "stroke-teal-500", fill: "fill-teal-500", border: "border-teal-500" },
  // { bg: "bg-sky-500", text: "text-sky-500", stroke: "stroke-sky-500", fill: "fill-sky-500", border: "border-sky-500" },
  // { bg: "bg-violet-500", text: "text-violet-500", stroke: "stroke-violet-500", fill: "fill-violet-500", border: "border-violet-500" },
  // { bg: "bg-fuchsia-500", text: "text-fuchsia-500", stroke: "stroke-fuchsia-500", fill: "fill-fuchsia-500", border: "border-fuchsia-500" },
  // { bg: "bg-surface-300", text: "text-surface-300", stroke: "stroke-surface-300", fill: "fill-surface-500", border: "border-surface-300" },
];

export type TaskColor = (typeof colors)[0];

export class Task {
  id = crypto.randomUUID();
  name = "";
  color = colors[4];
  startDate = 0;
  endDate = 0;
  active = false;
  hovered = false;
}

class Tracker {
  tasks: Writable<Task[]> = localStorageStore("tasks", []);
  #intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    selectedDate.subscribe((selected) => {
      console.log(selected.format());
      this.tasks.update((tasks) =>
        // Get tasks from db
        tasks.filter(
          (t) =>
            t.endDate > selected.startOf("day").valueOf() &&
            t.startDate < selected.endOf("day").valueOf()
        )
      );
    });
    const active = get(this.tasks).find((t) => t.active);
    if (active) {
      this.#startTimer();
    }
  }

  #startTimer() {
    this.#intervalId = setInterval(() => {
      console.log("tick");
      this.tasks.update((tasks) => {
        const active = tasks.find((t) => t.active);
        if (active) active.endDate = Date.now();
        return tasks;
      });
    }, 1000);
  }

  #stopTimer() {
    if (this.#intervalId) clearInterval(this.#intervalId);
  }

  start(task: Task) {
    this.stop();
    task.startDate = Date.now();
    task.endDate = Date.now();
    task.active = true;
    this.#startTimer();
  }

  stop() {
    this.#stopTimer();
    this.tasks.update((tasks) => {
      const index = tasks.findIndex((t) => t.active);
      if (index !== -1) {
        tasks[index].active = false;
      }
      return tasks;
    });
  }

  addTask(task: Task) {
    this.tasks.update((tasks) => {
      if (task.name === "") task.name = "Task " + (tasks.length + 1);
      // tasks.splice(
      //   tasks.findIndex((t) => t.startDate > task.startDate),
      //   0,
      //   task
      // );
      tasks.push(task);
      tasks.sort((a, b) => b.startDate - a.startDate);
      return tasks;
    });
  }

  removeTask(id: string) {
    this.tasks.update((tasks) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) throw new Error("Task not found"); // TODO what do
      if (tasks[index].active) this.#stopTimer();
      tasks.splice(index, 1);
      return tasks;
    });
  }
}

export const tracker = new Tracker();

export const taskDraft = writable(new Task());
