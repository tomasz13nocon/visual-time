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
  "#0ea5e9",
  "#8b5cf6",
  "#d946ef",
  "#878787",
  "#A72620",
  "#A97648",
  "#CDCD39",
  "#43BB66",
  "#2CD3CF",
  "#88BAF4",
  "#2727E3",
  "#2C2C2C",
];

export const colorsLight = [
  "#F5768C",
  "#F9A36E",
  "#F9C34E",
  "#A3D06B",
  "#5CA9F9",
  "#A17CF7",
  "#D46CF7",
  "#A3A3A3",

  "#A74843",
  "#B7895F",
  "#D4D46C",
  "#74CF8E",
  "#5EE0DD",
  "#A6CCF7",
  "#4E4EEB",
  "#3C3C3C",
];

export const defaultTaskNames = [
  "Inventing Flux Capacitor",
  "Creating billion dollar unicorn startup",
  "Eating pizza",
  "Writing script for my inevitable biopic",
  "Conquering Constantinople",
  "Summoning the Kraken",
  "Painting Mona Lisa",
  "Searching for Atlantis",
  "Proving P != NP",
  "Focusing intensely",
  "Crafting pickaxe",
  "Unraveling the mystery of time",
  "Ascending to another dimension",
  "Taming my pet dragon",
  "Building time machine",
  "Solving the Riemann hypothesis",
  "Building Dyson sphere",
  "Reading about trusses",

  "Delaying the crisis",
  "Creative Chaos Creation",
  "Diving into Knowledge Abyss",
];

export type TaskColor = (typeof colors)[0];

export class Task {
  id = -1;
  name = "";
  color = colors[4];
  startDate = 0;
  endDate = 0;
  active = false;

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
        return tasks;
      });
    }

    task.save(get(user)).then((savedTask) => {
      newTask.update((t) => {
        t.id = savedTask.id;
        return t;
      });
    });
  }

  updateTask(task: Task) {
    task.update(get(user));
  }

  removeTask(task: Task) {
    this.tasks.update((tasks) =>
      tasks.filter((taskStore) => {
        const taskI = get(taskStore);
        if (taskI === task) {
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
