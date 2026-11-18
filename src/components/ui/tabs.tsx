// Gen4 Tabs (Figma: ❖ Tabs) — Primary: segmented container (white, #CDD3DD stroke, radius 12, 4 inset), 40px tabs, selected #075EE8.
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("inline-flex h-12 items-center gap-1 rounded-[12px] border border-gen4-bg-200 bg-white p-1 text-black", className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] px-2 text-[14px] font-bold leading-4 text-black transition-colors hover:bg-gen4-action-soft active:bg-gen4-action-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:text-gen4-black-500 data-[state=active]:bg-gen4-action data-[state=active]:text-white",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn("focus-visible:outline-none", className)} {...props} />);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
