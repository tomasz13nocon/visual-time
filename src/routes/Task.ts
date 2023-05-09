import { writable } from "svelte/store";

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
  "#888888",
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
  id: string;
  name = "";
  color = colors[4];
  startTime = 0;
  endTime = 0;
  active = false;

  constructor() {
    this.id = crypto.randomUUID();
  }
}

class Tracker {
  tasks: Task[] = [];
  activeTask: Task | null = null;
  #intervalId: ReturnType<typeof setInterval> | null = null;

  #refreshStore() {
    tracker.set(this);
  }

  #startTimer() {
    if (this.tasks[0]?.active) {
      this.#intervalId = setInterval(() => {
        this.tasks[0].endTime = Date.now();
        this.#refreshStore();
      }, 1000);
    }
  }

  #stopTimer() {
    if (this.#intervalId) clearInterval(this.#intervalId);
  }

  start(task: Task) {
    this.stop();
    task.startTime = Date.now();
    task.endTime = Date.now();
    task.active = true;
    this.tasks = [task, ...this.tasks];
    this.activeTask = task;
    this.#startTimer();
  }

  stop() {
    const index = this.tasks.findIndex((t) => t.active);
    if (index === -1) return;
    this.tasks[index].active = false;
    this.#stopTimer();
    this.#refreshStore();
  }

  addTask(task: Task) {
    this.tasks.push(task);
    this.#refreshStore();
  }

  removeTask(id: string) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return;
    this.tasks.splice(index, 1);
    this.#refreshStore();
  }
}

export const tracker = writable(new Tracker());
