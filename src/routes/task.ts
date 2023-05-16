import { derived, get, writable, type Writable } from "svelte/store";
import { localStorageStore } from "@skeletonlabs/skeleton";
import { selectedDate, user } from "$lib/stores";
import { auth } from "$lib/auth";
import type { Dayjs } from "dayjs";
import type { User } from "firebase/auth";

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

// TODO figure out DB ids

async function fetchTasks(selectedDate: Dayjs, user: User | null) {
  if (!user) {
    // TODO local storage
    return [];
  }
  const resp = await authedFetch(
    user,
    `/api/tasks?from=${selectedDate.startOf("day").valueOf()}&to=${selectedDate
      .endOf("day")
      .valueOf()}`
  );
  const json = await resp.json();
  return json;
}

async function saveTask(task: Task, user: User | null) {
  if (user) {
    const resp = await authedFetch(user, `/api/tasks`, {
      method: "POST",
      body: JSON.stringify(task),
    });
  } else {
    // TODO local storage
  }
}

async function updateTask(task: Task, user: User | null) {
  if (user) {
    const resp = await authedFetch(user, `/api/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    });
  } else {
    // TODO local storage
  }
}

async function deleteTask(task: Task, user: User | null) {
  if (user) {
    const resp = await authedFetch(user, `/api/tasks/${task.id}`, {
      method: "DELETE",
    });
  } else {
    // TODO local storage
  }
}

// TODO subscribe to user and store in private field
class Tracker {
  tasks: Writable<Writable<Task>[]> = writable([]);
  activeTask: Writable<Task> | null = null;
  #intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    console.log("Tracker constructor");
    selectedDate.subscribe((selectedDate) => {
      console.log("selectedDate changed", selectedDate.format());
      fetchTasks(selectedDate, get(user)).then(this.#assignTasks.bind(this));
    });
    user.subscribe((user) => {
      console.log("user changed");
      fetchTasks(get(selectedDate), user).then(this.#assignTasks.bind(this));
    });
  }

  // Sets the tasks store and activeTask from tasks returned from the API
  #assignTasks(tasks: Task[]) {
    // If what we're fetching doesn't contain the active task then we won't know about it,
    // and activeTask will be null even though it exists in the DB.
    // Generally at first load we always fetch current day, and active tasks can only be in current day, so should be fine.
    this.tasks.set(
      tasks.map((t: Task) => {
        const task = writable(t);
        if (t.active) {
          t.endDate = Date.now(); // To reduce delay of waiting for first interval
          this.activeTask = task;
          this.#stopTimer();
          this.#startTimer();
        }
        return task;
      })
    );
  }

  #startTimer() {
    this.#intervalId = setInterval(() => {
      console.log("tick");
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
    this.activeTask = null;
    this.tasks.update((tasks) => {
      const task = tasks.find((t) => get(t).active);
      task?.update((task) => {
        task.active = false;
        updateTask(task, get(user));
        return task;
      });
      return tasks;
    });
  }

  // TODO sort everywhere

  addTask(task: Task, startTracking = false) {
    if (startTracking) {
      this.stop();
      task.endDate = Date.now();
      task.active = true;
      this.#startTimer();
    }

    this.tasks.update((tasks) => {
      if (task.name === "") task.name = "Task " + (tasks.length + 1);
      const newTask = writable(task);
      tasks.splice(
        tasks.findIndex((t) => get(t).startDate > task.startDate),
        0,
        newTask
      );
      // this.tasks.push(writable(task));
      // this.tasks.sort((a, b) => b.startDate - a.startDate);
      if (startTracking) this.activeTask = newTask;
      return tasks;
    });

    saveTask(task, get(user));
  }

  removeTask(id: string) {
    this.tasks.update((tasks) =>
      tasks.filter((t) => {
        const task = get(t);
        if (task.id === id) {
          if (task.active) {
            this.#stopTimer();
            this.activeTask = null;
          }
          deleteTask(task, get(user));
          return false;
        }
        return true;
      })
    );
  }
}

const tracker = new Tracker();
const taskDraft = writable(new Task());
export { tracker, taskDraft };
