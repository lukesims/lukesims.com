import type { ComponentProps } from "react";
import { Toaster as Sonner, toast as sonner } from "sonner";

import {
  Alert,
  AlertDescription,
  type AlertStyleVariants,
  AlertTitle,
} from "~/components/alert";

export interface ToastProps {
  description: string;
  duration?: number;
  icon?: string;
  title: string;
  variant?: AlertStyleVariants["variant"];
}

export const toast = ({ duration = 5_000, ...props }: ToastProps) =>
  sonner.custom(() => <Toast {...props} />, { duration });

export const Toast = ({ description, icon, title, variant }: ToastProps) => (
  <Alert className="toast" variant={variant}>
    {icon && <span className={icon}></span>}
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
);

export type ToasterProps = ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="top-center"
    toastOptions={{ classNames: { toast: "w-full" } }}
    {...props}
  />
);
