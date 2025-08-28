import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const intervalButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-interval-button text-foreground hover:bg-interval-button-hover",
        active: "bg-interval-button-active text-interval-button-active-foreground shadow-sm",
        loading: "bg-interval-button text-muted-foreground cursor-not-allowed animate-pulse-subtle",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface IntervalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof intervalButtonVariants> {
  isActive?: boolean
  isLoading?: boolean
}

const IntervalButton = React.forwardRef<HTMLButtonElement, IntervalButtonProps>(
  ({ className, variant, size, isActive, isLoading, disabled, ...props }, ref) => {
    // Determine the variant based on state
    const computedVariant = isLoading ? "loading" : isActive ? "active" : variant

    return (
      <button
        className={cn(intervalButtonVariants({ variant: computedVariant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      />
    )
  }
)
IntervalButton.displayName = "IntervalButton"

export { IntervalButton, intervalButtonVariants }