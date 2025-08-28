import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
    "rounded-lg border bg-card text-card-foreground transition-all duration-200",
    {
        variants: {
            variant: {
                default: "border-border shadow-sm hover:shadow-md",
                elevated: "shadow-md hover:shadow-lg border-border",
                outline: "border-2 border-border shadow-none hover:shadow-sm",
                ghost: "border-transparent shadow-none hover:border-border hover:shadow-sm",
                primary: "border-primary/20 bg-primary/5 shadow-sm hover:shadow-md",
                success: "border-success/20 bg-success/5 shadow-sm hover:shadow-md", 
                warning: "border-warning/20 bg-warning/5 shadow-sm hover:shadow-md",
                danger: "border-danger/20 bg-danger/5 shadow-sm hover:shadow-md",
                info: "border-info/20 bg-info/5 shadow-sm hover:shadow-md",
            },
            interactive: {
                true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                false: "",
            }
        },
        defaultVariants: {
            variant: "default",
            interactive: false,
        },
    }
)

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
    /** Whether the card is interactive (clickable) */
    interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, interactive, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant, interactive, className }))}
            {...props}
        />
    )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
