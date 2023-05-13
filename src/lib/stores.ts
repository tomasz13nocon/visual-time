import type { User } from "firebase/auth";
import dayjs from "$lib/dayjs";
import { writable, type Writable } from "svelte/store";

export const currentTimezone = writable(Intl.DateTimeFormat().resolvedOptions().timeZone);
export const selectedDate = writable(dayjs());
export const user: Writable<User | null> = writable(null);
