import * as RadixDialog from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "~/utils/styles";

export const Sheet = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;
export const SheetPortal = RadixDialog.Portal;

export function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Overlay>) {
  return (
    <RadixDialog.Overlay
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in bg-overlay fixed inset-0 z-50",
        className,
      )}
      {...props}
    />
  );
}

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof RadixDialog.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <RadixDialog.Content
        className={cn(
          "bg-card data-[state=open]:animate-in data-[state=closed]:animate-out border-border shadow-shadow fixed z-50 flex flex-col gap-4 border-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-300",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right top-2 right-0 bottom-4 w-3/4 border-r-0 sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left top-2 bottom-4 -left-2 w-3/4 border-l-0 pl-2 sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top -top-2 right-4 left-2 h-auto border-t-0 pt-2",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom right-4 bottom-0 left-2 h-auto border-b-0",
          className,
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close className="ring-offset-background data-[state=open]:bg-secondary text-card-foreground/70 absolute top-4 right-4 hover:bg-black hover:text-yellow-400 focus-visible:bg-black focus-visible:text-yellow-400 focus-visible:outline-hidden disabled:pointer-events-none">
          <span className="icon-[ri--close-line] block size-6"></span>
          <span className="sr-only">Close</span>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </SheetPortal>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={cn("text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
