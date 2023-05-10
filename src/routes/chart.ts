import dayjs from "dayjs";
import type { Task } from "./task";

const pi180 = Math.PI / 180;

export const rOuter = 360;
export const rInner = 240;

export function circleX(angle: number, radius: number) {
  return radius * Math.cos(angle * pi180);
}

export function circleY(angle: number, radius: number) {
  return radius * Math.sin(angle * pi180);
}

// angle to position on a circle with given radius as string "x y"
export function atop(angle: number, radius: number) {
  return `${circleX(angle, radius)} ${circleY(angle, radius)}`;
}

export function getTaskInfo(task: Task) {
  const startDate = dayjs(task.startTime);
  const endDate = dayjs(task.endTime);
  return {
    startDate,
    startDeg: (startDate.diff(dayjs().startOf("day")) / 86400000) * 360 - 90,
    endDate,
    endDeg: (endDate.diff(dayjs().startOf("day")) / 86400000) * 360 - 90,
  };
}
