import { nanoid } from "nanoid";
import { atom } from "nanostores";

import type { AlertStyleVariants } from "~/components/alert";

export interface Toast {
  id: string;
  variant?: AlertStyleVariants["variant"];
  title: string;
  description: string;
  icon?: string;
  duration?: number;
}

export const $toasts = atom<Toast[]>([]);

export function addToast(toast: Omit<Toast, "id">) {
  $toasts.set([...$toasts.get(), { id: nanoid(5), ...toast }]);
}

export function removeToast(id: Toast["id"]) {
  $toasts.set($toasts.get().filter((t) => t.id != id));
}
