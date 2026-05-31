import { cx } from "class-variance-authority";

export function cn(...inputs: any[]) {
  return cx(inputs);
}
