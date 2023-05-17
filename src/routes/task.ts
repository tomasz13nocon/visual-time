import { derived, get, writable, type Writable } from "svelte/store";
import { fetchingTasks, selectedDate, selectedDateEnd, selectedDateStart, user } from "$lib/stores";
import type { Dayjs } from "dayjs";
import type { User } from "firebase/auth";
import dayjs from "dayjs";

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

export const colorsLight = [
  "#F5768C",
  "#F9A36E",
  "#F9C34E",
  "#A3D06B",
  // "#5CC8D6",
  "#5CA9F9",
  "#A17CF7",
  "#D46CF7",
  "#A3A3A3",
];

export const defaultTaskNames = [
  "Inventing Flux Capacitor",
  "Starting a billion dollar company",
  "Eating pizza",
  "Writing the script for my inevitable biopic",
  // "Unleashing Imagination Beast",
  "Embarking on Epic Quest",
  "Creative Chaos Creation",
  "Sailing the Sea of Inspiration",
  // "Marvelous Masterpiece Crafting",
  // "Conquering the Innovation Galaxy",
  "Unraveling the Mystery of Time",
  // "Dream-Weaving Extravaganza",
  "Experiencing Zenith of Productivity",
  "Summoning the Muse's Magic",
  "Diving into Knowledge Abyss",
  // "Whirling Dance of Productivity",
  "Quest for the Perfect Solution",
  "Brainstorming Bonanza",
  "Crafting Wonders of Creativity",
  "Symphony of Task Accomplishment",
  "Taming the Chaos Dragon",
  "Expedition to Efficiency Island",
  "Building Bridges of Success",
  "Igniting the Spark of Innovation",
  "Painting the Canvas of Achievement",
  "Trailblazing Towards Excellence",
  "Choreography of Accomplishment",
  "Sculpting the Path of Progress",
  "Capturing the Essence of Brilliance",
  "Soaring to New Heights of Achievement",
  "Unleashing the Power of Focus",
  "Juggling Acts of Success",
  "Scripting Success Stories",
  // "Riding the Wave of Productivity"
];

export type TaskColor = (typeof colors)[0];

export class Task {
  id = -1;
  name = "";
  color = colors[4];
  startDate = 0;
  endDate = 0;
  active = false;
  hovered = false;

  constructor(init?: Partial<Task>) {
    if (init) Object.assign(this, init);
  }

  async save(user: User | null) {
    if (user) {
      const resp = await authedFetch(user, `/api/tasks`, {
        method: "POST",
        body: JSON.stringify(this),
      });
      return resp.json();
    } else {
      // TODO local storage
    }
  }

  async update(user: User | null) {
    if (user) {
      const resp = await authedFetch(user, `/api/tasks/${this.id}`, {
        method: "PUT",
        body: JSON.stringify(this),
      });
    } else {
      // TODO local storage
    }
  }

  async delete(user: User | null) {
    if (user) {
      const resp = await authedFetch(user, `/api/tasks/${this.id}`, {
        method: "DELETE",
      });
    } else {
      // TODO local storage
    }
  }
}

// TODO add try catch everywhere

async function authedFetch(user: User, input: RequestInfo | URL, init?: RequestInit) {
  const token = await user.getIdToken();
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

async function fetchTasks(from: Dayjs, to: Dayjs, user: User | null) {
  if (!user) {
    // TODO local storage
    return [];
  }
  const resp = await authedFetch(user, `/api/tasks?from=${from.valueOf()}&to=${to.valueOf()}`);
  const json = await resp.json();
  return json;
}

// TODO subscribe to user and store in private field
class Tracker {
  tasks: Writable<Writable<Task>[]> = writable([]);
  activeTask: Writable<Task> | null = null;
  #intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    derived([selectedDateStart, selectedDateEnd, user], (stores) => stores).subscribe(
      ([selectedDateStart, selectedDateEnd, user]) => {
        fetchingTasks.set(true);
        fetchTasks(selectedDateStart, selectedDateEnd, user).then((tasks: Task[]) => {
          // If what we're fetching doesn't contain the active task then we won't know about it,
          // and activeTask will be null even though it exists in the DB.
          // Generally at first load we always fetch current day, and active tasks can only be in current day, so should be fine.
          this.tasks.set(
            tasks.map((apiTask: Task) => {
              const task = new Task(apiTask);
              const taskStore = writable(task);
              if (task.active) {
                task.endDate = Date.now(); // To reduce delay of waiting for first interval
                this.activeTask = taskStore;
                this.#stopTimer();
                this.#startTimer();
              }
              return taskStore;
            })
          );
          fetchingTasks.set(false);
        });
      }
    );
  }

  #startTimer() {
    this.#intervalId = setInterval(() => {
      // console.log("tick");
      // TODO if null cancel interval?
      this.activeTask?.update((task) => {
        task!.endDate = Date.now();
        return task;
      });
    }, 1000);
  }

  #stopTimer() {
    if (this.#intervalId) clearInterval(this.#intervalId);
  }

  stop() {
    this.#stopTimer();
    if (this.activeTask) {
      this.activeTask.update((task) => {
        task.active = false;
        task.update(get(user));
        return task;
      });
    }
    this.activeTask = null;
  }

  addTask(task: Task, startTracking = false) {
    if (task.name === "")
      task.name = defaultTaskNames[Math.floor(Math.random() * defaultTaskNames.length)];

    if (startTracking) {
      this.stop();
      task.endDate = Date.now();
      task.active = true;
      this.#startTimer();
    }

    const newTask = writable(task);

    if (startTracking) this.activeTask = newTask;

    if (get(selectedDate).isSame(task.startDate, "day")) {
      this.tasks.update((tasks) => {
        const index = tasks.findIndex((t) => get(t).startDate < task.startDate);
        tasks.splice(index === -1 ? tasks.length : index, 0, newTask);
        // tasks.push(newTask);
        // tasks.sort((a, b) => get(a).startDate - get(b).startDate);
        return tasks;
      });
    }

    task.save(get(user)).then((savedTask) => {
      task.id = savedTask.id;
    });
  }

  removeTask(id: number) {
    this.tasks.update((tasks) =>
      tasks.filter((t) => {
        const task = get(t);
        if (task.id === id) {
          if (task.active) {
            this.#stopTimer();
            this.activeTask = null;
          }
          task.delete(get(user));
          return false;
        }
        return true;
      })
    );
  }
}

export function createTaskDraft(task: Task) {
  const oldColor = task.color;
  const ret = new Task();
  ret.color = oldColor;
  return ret;
}

const tracker = new Tracker();
const taskDraft = writable(new Task());
export { tracker, taskDraft };
