export const rOuter = 360;
export const rInner = 240;
const gridStepMinutes = 5;
const gridStep = gridStepMinutes / (24 * 60);

// All functions dealing with degrees are adjusted to having 0 degrees at 12 o'clock
// export function degToPosX(angle: number, radius: number) {
//   return radius * Math.cos(angle * (Math.PI / 180));
// }
//
// export function degToPosY(angle: number, radius: number) {
//   return radius * Math.sin(angle * (Math.PI / 180));
// }
//
// // convert angle in degrees to position on a circle with given radius. Returns string "x y"
// export function degToPosStr(angle: number, radius: number) {
//   return `${degToPosX(angle, radius)} ${degToPosY(angle, radius)}`;
// }
//
// // convert coordinates to angle in degrees
// export function posToDeg(x: number, y: number) {
//   return (-((Math.atan2(-y, x) * 180) / Math.PI) + 360) % 360;
// }
//
// export function getTaskInfo(task: Task) {
//   const startDate = dayjs(task.startDate);
//   const endDate = dayjs(task.endDate);
//   return {
//     startDate,
//     startDeg: (startDate.diff(dayjs().startOf("day")) / 86400000) * 360 - 90,
//     endDate,
//     endDeg: (endDate.diff(dayjs().startOf("day")) / 86400000) * 360 - 90,
//   };
// }
//
// // convert degrees to time in milliseconds
// export function degToTime(deg: number) {
//   return (deg / 360) * 24 * 60 * 60 * 1000;
// }
//
// // convert time in milliseconds to degrees
// export function timeToDeg(ms: number) {
//   return (ms / (24 * 60 * 60 * 1000)) * 360 - 90;
// }
//
////////////////////////

/**
 * Stores a time offset from the beginning of the day
 * Provides utilities for converting between degrees, milliseconds and coordinates on a circle
 * Meant to be created with factory functions
 */
class TimePos {
  // time as fraction of a day
  time: number;

  constructor(time: number) {
    this.time = time;
  }

  toDeg() {
    return this.time * 360;
  }

  toPosX(radius = 1) {
    return Math.sin(this.time * 2 * Math.PI) * radius;
  }

  toPosY(radius = 1) {
    return -Math.cos(this.time * 2 * Math.PI) * radius;
  }

  toPosStr(radius = 1) {
    return `${this.toPosX(radius)} ${this.toPosY(radius)}`;
  }

  toMs() {
    return this.time * 24 * 60 * 60 * 1000;
  }

  snapToGrid() {
    this.time = Math.round(this.time / gridStep) * gridStep;
    return this;
  }
}

export function fromDeg(deg: number) {
  return new TimePos(deg / 360);
}

export function fromMs(ms: number) {
  // dayjs(ms).diff(dayjs(ms).hour(0).minute(0).second(0).millisecond(0), "day", true)
  // TODO handle timezones properly
  return new TimePos((ms / 1000 / 60 - new Date().getTimezoneOffset()) / 60 / 24);
}

export function fromPos(x: number, y: number) {
  // negate y to convert from screen to cartesian
  // negate atan2 to go clockwise
  // add 2.5pi, div by 2pi and modulo 1 to start at 12 o'clock and get a value between 0 and 1
  return new TimePos(((-Math.atan2(-y, x) + Math.PI * 2.5) / (Math.PI * 2)) % 1);
}
