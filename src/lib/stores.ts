import type { User } from "firebase/auth";
import dayjs from "$lib/dayjs";
import { derived, writable, type Writable } from "svelte/store";

export const currentTimezone = writable(Intl.DateTimeFormat().resolvedOptions().timeZone);
export const selectedDate = writable(dayjs());
export const selectedDateStart = derived(selectedDate, (date) => date.startOf("day"));
export const selectedDateEnd = derived(selectedDate, (date) => date.endOf("day"));
export const user: Writable<User | null> = writable(null);
export const fetchingTasks = writable(false);
