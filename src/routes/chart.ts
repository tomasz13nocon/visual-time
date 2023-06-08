import type { Dayjs } from "dayjs";
import type { Task } from "./task";

export const rOuter = 360;
export const rInner = 220;
const gridStepMinutes = 5;
const gridStep = gridStepMinutes * 60 * 1000;

/**
 * Stores time and provides utilities for converting between degrees, milliseconds and coordinates on a circle
 * Is immutable, methods return new instances
 * Time is stored as UTC. Use local() to convert to local time, before conversion operations
 * Meant to be created with factory functions
 */
class TimePos {
  time: number;

  constructor(time: number) {
    this.time = time;
  }

  toDay() {
    return this.time / (24 * 60 * 60 * 1000);
  }

  toDeg() {
    return this.local().toDay() * 360;
  }

  toPosX(radius = 1) {
    return Math.sin(this.local().toDay() * 2 * Math.PI) * radius;
  }

  toPosY(radius = 1) {
    return -Math.cos(this.local().toDay() * 2 * Math.PI) * radius;
  }

  toPosStr(radius = 1) {
    return `${this.toPosX(radius)} ${this.toPosY(radius)}`;
  }

  toMs() {
    return this.time;
  }

  /** Convert to local time */
  local() {
    return new TimePos(this.time - new Date().getTimezoneOffset() * 60 * 1000);
  }

  snapToGrid() {
    return new TimePos(Math.round(this.time / gridStep) * gridStep);
  }

  snapToGridOrTasks(tasks: Task[]) {
    let minD = Infinity;
    let snapTo: number | null = null;
    const snapStrength = 1.5;
    for (const task of tasks) {
      const startD = Math.abs(task.startDate - this.time);
      const endD = Math.abs(task.endDate - this.time);
      if (startD < minD) {
        minD = startD;
        snapTo = task.startDate;
      }
      if (endD < minD) {
        minD = endD;
        snapTo = task.endDate;
      }
    }
    if (snapTo !== null && minD < gridStep * snapStrength) {
      return new TimePos(snapTo);
    }
    return this.snapToGrid();
  }
}

export function fromDeg(deg: number, date?: Dayjs) {
  return new TimePos((deg / 360) * 24 * 60 * 60 * 1000 + (date?.valueOf() ?? 0));
}

export function fromMs(ms: number) {
  return new TimePos(ms);
}

export function fromPos(x: number, y: number, date?: Dayjs) {
  // negate y to convert from screen to cartesian
  // negate atan2 to go clockwise
  // add 2.5pi, div by 2pi and modulo 1 to start at 12 o'clock and get a value between 0 and 1
  return new TimePos(
    (((-Math.atan2(-y, x) + Math.PI * 2.5) / (Math.PI * 2)) % 1) * 24 * 60 * 60 * 1000 +
    (date?.valueOf() ?? 0)
  );
}
