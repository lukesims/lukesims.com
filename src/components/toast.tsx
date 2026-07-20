import { useStore } from "@nanostores/react";
import { Toast as RadixToast } from "radix-ui";

import { Alert, AlertDescription, AlertTitle } from "~/components/alert";
import {
  $toasts,
  addToast,
  removeToast,
  type Toast as ToastProps,
} from "~/stores/toast";

export const Toaster = () => {
  const toasts = useStore($toasts);
  return (
    <RadixToast.Provider duration={5000} swipeDirection="up">
      {toasts.map((toast) => (
        <Toast {...toast} key={toast.id} />
      ))}
      <RadixToast.Viewport className="fixed top-28 left-1/2 z-100 flex w-[calc(100vw-2rem)] max-w-100 -translate-x-1/2 transform list-none flex-col gap-3 outline-none" />
    </RadixToast.Provider>
  );
};

export const Toast = ({
  description,
  duration,
  icon,
  id,
  title,
  variant,
}: ToastProps) => (
  <RadixToast.Root
    asChild
    duration={duration}
    onOpenChange={() => removeToast(id)}
  >
    <Alert
      className="data-[state=closed]:animate-hide data-[state=open]:animate-slide-in-down data-[swipe=end]:animate-toast-swipe data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y)"
      variant={variant}
    >
      {icon && <span className={icon}></span>}
      <RadixToast.Title asChild>
        <AlertTitle>{title}</AlertTitle>
      </RadixToast.Title>
      <RadixToast.Description asChild>
        <AlertDescription>{description}</AlertDescription>
      </RadixToast.Description>
    </Alert>
  </RadixToast.Root>
);

const toast = (t: Omit<ToastProps, "id">) => addToast(t);

toast.danger = (t: Omit<ToastProps, "id" | "variant">) =>
  toast({ icon: "icon-[ri--error-warning-line]", variant: "danger", ...t });

toast.info = (t: Omit<ToastProps, "id" | "variant">) =>
  toast({ icon: "icon-[ri--information-2-line]", variant: "info", ...t });

toast.success = (t: Omit<ToastProps, "id" | "variant">) =>
  toast({ icon: "icon-[ri--checkbox-circle-line]", variant: "success", ...t });

export { toast, type ToastProps };
