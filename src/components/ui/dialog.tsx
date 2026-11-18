import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalContainer } from "./portal-context";

/**
 * Non-modal at the Radix level so the developer panel OUTSIDE the phone stays usable while an
 * in-phone overlay is open. A scrim inside the phone screen provides the modal look & dismissal.
 */
const Dialog = (props: React.ComponentProps<typeof DialogPrimitive.Root>) => <DialogPrimitive.Root modal={false} {...props} />;

/** Ignore interactions outside the simulated phone (e.g. the dev panel) instead of closing. */
const keepOpenOutsidePhone = (e: { target: EventTarget | null; preventDefault: () => void }) => {
  const el = e.target as HTMLElement | null;
  if (!el?.closest?.("[data-phone-screen]")) e.preventDefault();
};
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "absolute inset-0 z-50 bg-black/45 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => {
  const container = usePortalContainer();
  return (
    <DialogPrimitive.Portal container={container}>
      <div className="absolute inset-0 z-50 bg-black/60 animate-in fade-in-0" aria-hidden />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "absolute left-1/2 top-1/2 z-50 grid w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-[24px] bg-white px-5 py-6 shadow-lift duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
        onInteractOutside={(e) => {
          keepOpenOutsidePhone(e);
          props.onInteractOutside?.(e);
        }}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute -top-[52px] left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-white text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 text-center", className)} {...props} />
);
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2", className)} {...props} />
);

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-heading text-black", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-small text-airtel-sub", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export { DialogOverlay };
export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
