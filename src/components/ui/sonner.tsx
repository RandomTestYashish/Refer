import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Gen4 Toast (Figma: ❖ Toast): radius 16, 16 inset, 1px stroke, Body/SM/Medium 14/16, 24px icon.
 * Default (info) blue, Success green, Warning yellow, Error red, Dark gradient for neutral messages.
 * Rendered inside the phone screen so toasts stay in the device.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="top-center"
    offset={52}
    duration={2600}
    toastOptions={{
      classNames: {
        toast:
          "group !w-[343px] !gap-1 !rounded-[16px] !border !border-transparent [&:not([data-type])]:!bg-gradient-to-b [&:not([data-type])]:!from-black [&:not([data-type])]:!to-[#2D2B2B] data-[type=loading]:!bg-black !p-4 !text-[14px] !font-medium !leading-4 [&:not([data-type])]:!text-white data-[type=loading]:!text-white !shadow-lift [&_[data-icon]]:!size-6 [&_[data-icon]_svg]:!size-6",
        description: "!mt-1 !text-[12px] !font-normal !leading-[18px] !opacity-80",
        actionButton: "!h-6 !rounded-[8px] !border !border-current !bg-transparent !px-3 !text-[12px]",
        success: "!border-airtel-success-line !bg-airtel-success-soft !text-airtel-success",
        error: "!border-airtel-error-line !bg-airtel-error-soft !text-airtel-error",
        warning: "!border-airtel-warning-line !bg-airtel-warning-soft !text-airtel-warning-text",
        info: "!border-gen4-action-line !bg-gen4-action-soft !text-gen4-action",
      },
    }}
    {...props}
  />
);

export { Toaster };
