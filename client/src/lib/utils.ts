import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createBlobs() {
  return {
    topRight: {
      width: Math.floor(Math.random() * 20) + 40 + "%",
      height: Math.floor(Math.random() * 20) + 40 + "%",
      transform: `translate(${Math.floor(Math.random() * 10)}%, ${Math.floor(Math.random() * 10)}%) scale(${Math.random() * 0.1 + 0.95})`,
    },
    bottomLeft: {
      width: Math.floor(Math.random() * 20) + 40 + "%",
      height: Math.floor(Math.random() * 20) + 40 + "%",
      transform: `translate(${Math.floor(Math.random() * 10)}%, ${Math.floor(Math.random() * 10)}%) scale(${Math.random() * 0.1 + 0.95})`,
    },
  };
}
