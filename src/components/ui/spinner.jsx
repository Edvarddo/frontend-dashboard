import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva("flex flex-col items-center justify-center", {
  variants: {
    show: {
      true: "flex",
      false: "hidden",
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva("animate-spin", {
  variants: {
    size: {
      small: "size-6",
      medium: "size-8",
      large: "size-12",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const Spinner = React.forwardRef(
  ({ size = "medium", show = true, asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp className={cn(spinnerVariants({ show }), className)} ref={ref} {...props}>
        <Loader2 className={cn(loaderVariants({ size }))} />
        {props.children}
      </Comp>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants, loaderVariants };