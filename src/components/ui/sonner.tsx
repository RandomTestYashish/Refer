import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Airtel-styled toast. Rendered inside the phone screen so toasts stay in the device. */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="top-center"
    offset={52}
    duration={2600}
    toastOptions={{
      classNames: {
        toast:
          "group !rounded-[14px] !border-0 !bg-airtel-ink !text-white !shadow-lift !px-4 !py-3 !text-[13px] !font-medium !w-[335px]",
        description: "!text-white/70",
        actionButton: "!bg-white !text-airtel-ink !rounded-[8px]",
        success: "[&_[data-icon]]:!text-[#4ADE80]",
        error: "[&_[data-icon]]:!text-[#FF8A80]",
      },
    }}
    {...props}
  />
);

export { Toaster };
