import * as React from "react"
import { cn } from "../../lib/utils"
import { VariantProps, cva } from "class-variance-authority"

const spinnerVariants = cva(
    "animate-spin rounded-full border-solid border-current border-r-transparent",
    {
        variants: {
            size: {
                sm: "h-4 w-4 border-2",
                default: "h-6 w-6 border-2",
                lg: "h-8 w-8 border-2",
                xl: "h-12 w-12 border-4",
            },
            variant: {
                default: "text-primary",
                muted: "text-muted-foreground",
                destructive: "text-destructive",
                white: "text-white",
                accent: "text-accent-foreground",
            }
        },
        defaultVariants: {
            size: "default",
            variant: "default",
        },
    }
)

export interface LoadingSpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
    text?: string
    centered?: boolean
    fullScreen?: boolean
    overlay?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
    ({
        className,
        size,
        variant,
        text,
        centered = false,
        fullScreen = false,
        overlay = false,
        ...props
    }, ref) => {
        const Spinner = (
            <div className={cn(spinnerVariants({ size, variant }), className)} />
        )

        const Content = (
            <div className={cn(
                "flex items-center gap-3",
                centered && "justify-center",
                text ? "flex-col gap-2" : ""
            )}>
                {Spinner}
                {text && (
                    <p className={cn(
                        "text-sm",
                        variant === "white" ? "text-white" :
                            variant === "muted" ? "text-muted-foreground" :
                                "text-foreground"
                    )}>
                        {text}
                    </p>
                )}
            </div>
        )

        if (fullScreen) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        "fixed inset-0 z-50 flex items-center justify-center",
                        overlay ? "bg-background/80 backdrop-blur-sm" : ""
                    )}
                    {...props}
                >
                    {Content}
                </div>
            )
        }

        if (centered) {
            return (
                <div
                    ref={ref}
                    className={cn("flex items-center justify-center p-4", className)}
                    {...props}
                >
                    {Content}
                </div>
            )
        }

        return (
            <div ref={ref} className={className} {...props}>
                {Content}
            </div>
        )
    }
)

LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner, spinnerVariants }
