import { derived, get, writable, type Readable, type Writable } from "svelte/store";
import { fetchingTasks, selectedDate, selectedDateEnd, selectedDateStart, user } from "$lib/stores";
import type { Dayjs } from "dayjs";
import type { User } from "firebase/auth";

export interface TaskTemplate {
  name: string;
  color: string;
}
export interface TagTemplate {
  name: string;
}

// prettier-ignore
export const colors = [
  { color: "#f43f5e", light: "#F5768C", label: "red" },
  { color: "#f97316", light: "#F9A36E", label: "orange" },
  { color: "#eab308", light: "#F9C34E", label: "yellow" },
  { color: "#84cc16", light: "#A3D06B", label: "green" },
  { color: "#0ea5e9", light: "#5CA9F9", label: "blue" },
  { color: "#8b5cf6", light: "#A17CF7", label: "purple" },
  { color: "#d946ef", light: "#D46CF7", label: "pink" },
  { color: "#878787", light: "#A3A3A3", label: "grey" },
  { color: "#A72620", light: "#A74843", label: "dark red" },
  { color: "#A97648", light: "#B7895F", label: "brown" },
  { color: "#CDCD39", light: "#D4D46C", label: "lime" },
  { color: "#43BB66", light: "#74CF8E", label: "dark green" },
  { color: "#2CD3CF", light: "#5EE0DD", label: "cyan" },
  { color: "#88BAF4", light: "#A6CCF7", label: "sky blue" },
  { color: "#2727E3", light: "#4E4EEB", label: "dark blue" },
  { color: "#2C2C2C", light: "#3C3C3C", label: "black" },
];

export const defaultTaskNames = [
  "Inventing Flux Capacitor",
  "Creating billion dollar unicorn startup",
  "Eating pizza",
  "Writing script for my inevitable biopic",
  "Conquering Constantinople",
  "Summoning Kraken",
  "Painting Mona Lisa",
  "Searching for Atlantis",
  "Proving P != NP",
  "Focusing intensely",
  "Crafting pickaxe",
  "Unraveling mystery of time",
  "Ascending to another dimension",
  "Playing with my pet donkey",
  "Building time machine",
  "Solving riemann hypothesis",
  "Constructing Dyson sphere",
  "Reading about trusses",
  "Delaying the crisis",
];

export const fetchError = writable("");

export interface Tag {
  name: string;
}

export class Task {
  // in case of errors/or slow network + race conditions
  // we can have multiple unpersisted tasks, so we need to have a unique local id
  id = Math.random();
  name = "";
  color = colors[4].color;
  startDate = 0;
  endDate = 0;
  active = false;
  tags: Tag[] = [];

  constructor(init?: Partial<Task>) {
    if (init) Object.assign(this, init);
  }

  async save(user: User | null): Promise<Task | undefined> {
    if (!user) {
      // TODO local storage
      return;
    }

    try {
      const resp = await authedFetch(user, `/api/tasks`, {
        method: "POST",
        body: JSON.stringify(this),
      });
      if (!resp.ok) throw new Error();
      return await resp.json();
    } catch (e) {
      fetchError.set("Error: Could not save task. Please refresh the page and try again.");
    }
  }

  async update(user: User | null): Promise<void> {
    if (!user) {
      // TODO local storage
      return;
    }

    try {
      const resp = await authedFetch(user, `/api/tasks/${this.id}`, {
        method: "PUT",
        body: JSON.stringify(this),
      });
      if (!resp.ok) throw new Error();
    } catch (e) {
      fetchError.set("Error: Could not update task. Please refresh the page and try again.");
    }
  }

  async delete(user: User | null): Promise<void> {
    if (!user) {
      // TODO local storage
      return;
    }

    try {
      const resp = await authedFetch(user, `/api/tasks/${this.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error();
    } catch (e) {
      fetchError.set("Error: Could not delete task. Please refresh the page and try again.");
    }
  }
}

async function authedFetch(
  user: User,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await user.getIdToken();
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/** Never rejects. On error sets fetchError store */
async function fetchTasks(from: Dayjs, to: Dayjs, user: User | null): Promise<Task[]> {
  if (!user) {
    // TODO local storage
    return [];
  }

  try {
    const resp = await authedFetch(user, `/api/tasks?from=${from.valueOf()}&to=${to.valueOf()}`);
    if (!resp.ok) throw new Error();
    return await resp.json();
  } catch (e) {
    fetchError.set("Error: Could not fetch tasks");
  }
  return [];
}

async function fetchActive(user: User | null): Promise<Task | undefined | null> {
  if (!user) {
    // TODO local storage
    return;
  }

  try {
    const resp = await authedFetch(user, `/api/tasks/active`);
    if (!resp.ok) throw new Error();
    return await resp.json();
  } catch (e) {
    fetchError.set("Error: Could not fetch tasks");
  }
}

export async function fetchTaskTemplates(user: User | null): Promise<TaskTemplate[]> {
  if (!user) {
    // TODO local storage
    return [];
  }

  try {
    const resp = await authedFetch(user, `/api/tasks/templates`);
    if (!resp.ok) throw new Error();
    return await resp.json();
  } catch (e) {
    fetchError.set("Error: Could not fetch task names");
  }
  return [];
}

export async function fetchTagTemplates(user: User | null): Promise<TagTemplate[]> {
  if (!user) {
    // TODO local storage
    return [];
  }

  try {
    const resp = await authedFetch(user, `/api/tags`);
    if (!resp.ok) throw new Error();
    return await resp.json();
  } catch (e) {
    fetchError.set("Error: Could not fetch tag names");
  }
  return [];
}

// TODO subscribe to user and store in private field
class Tracker {
  tasks: Writable<Writable<Task>[]> = writable([]);
  inactiveTasks: Readable<Writable<Task>[]> = derived(this.tasks, ($tasks) => {
    console.log($tasks.map((t) => get(t).name + " " + get(t).active));
    return $tasks.filter((task) => !get(task).active);
  });
  activeTask: Writable<Writable<Task> | null> = writable(null);
  #intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // user.subscribe((user) => {
    //   fetchActive(user).then((apiTask) => {
    //     if (apiTask) {
    //       apiTask.endDate = Date.now(); // To reduce delay of waiting for first interval
    //       this.activeTask = writable(new Task(apiTask));
    //       this.#startTimer();
    //     }
    //   });
    // });
    derived([selectedDateStart, selectedDateEnd, user], (stores) => stores).subscribe(
      ([selectedDateStart, selectedDateEnd, user]) => {
        // this.#stopTimer();
        this.tasks.set([]);
        if (!user) {
          this.activeTask.set(null);
        }
        fetchingTasks.set(true);
        fetchTasks(selectedDateStart, selectedDateEnd, user).then((apiTasks) => {
          // If what we're fetching doesn't contain the active task then we won't know about it,
          // and activeTask will be null even though it exists in the DB.
          // Generally at first load we always fetch current day, and active tasks can only be in current day, so should be fine.
          this.tasks.set(
            apiTasks.map((apiTask) => {
              const task = new Task(apiTask);
              const taskStore = writable(task);
              if (task.active) {
                task.endDate = Date.now(); // To reduce delay of waiting for first interval
                this.activeTask.set(taskStore);
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
    this.#stopTimer();
    this.#intervalId = setInterval(() => {
      const activeTask = get(this.activeTask);
      if (activeTask) {
        activeTask.update((task) => {
          task.endDate = Date.now();
          return task;
        });
      } else {
        this.#stopTimer();
      }
    }, 1000);
  }

  #stopTimer() {
    if (this.#intervalId) clearInterval(this.#intervalId);
  }

  #insertIntoTasks(task: Writable<Task>) {
    this.tasks.update((tasks) => {
      const index = tasks.findIndex((t) => get(t).startDate < get(task).startDate);
      tasks.splice(index === -1 ? tasks.length : index, 0, task);
      return tasks;
    });
  }

  stop() {
    this.#stopTimer();
    // console.log(get(this.tasks).map((t) => get(t).name));
    this.activeTask.update((taskStore) => {
      taskStore?.update((task) => {
        task.active = false;
        task.update(get(user));
        return task;
      });
      return null;
    });
    // console.log(get(this.tasks).map((t) => get(t).name));
  }

  addTask(task: Task, startTracking = false) {
    task.name = task.name || defaultTaskNames[Math.floor(Math.random() * defaultTaskNames.length)];

    const taskStore = writable(task);

    if (startTracking) {
      this.stop();
      task.endDate = Date.now();
      task.active = true;
      this.#startTimer();
      this.activeTask.set(taskStore);
    }
    // Only add to tasks if it overlaps selected date
    if (
      task.startDate < get(selectedDateEnd).valueOf() &&
      task.endDate > get(selectedDateStart).valueOf()
    ) {
      this.#insertIntoTasks(taskStore);
    }

    task.save(get(user)).then((savedTask) => {
      taskStore.update((t) => {
        t.id = savedTask?.id ?? Math.random(); // TODO: localStorage IDs, and also handle errors
        return t;
      });
    });
  }

  updateTask(task: Task) {
    task.update(get(user));
  }

  removeTask(task: Task) {
    if (task.active) {
      this.#stopTimer();
      this.activeTask.set(null);
    }
    this.tasks.update((tasks) => tasks.filter((taskStore) => get(taskStore) !== task));
    task.delete(get(user));
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
