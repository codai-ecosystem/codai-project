import * as React from "react"
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from "@/lib/utils"

const cardVariants = cva(
    "rounded-lg border bg-card text-card-foreground transition-all duration-200",
    {
        variants: {
            variant: {
                default: "shadow-sm hover:shadow-md",
                elevated: "shadow-md hover:shadow-lg",
                outline: "border-2 hover:border-primary/50",
                ghost: "border-transparent shadow-none hover:bg-accent/50",
                gradient: "bg-gradient-to-br from-background to-muted border-transparent shadow-lg",
                success: "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20",
                warning: "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/20",
                error: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20",
                info: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20",
            },
            size: {
                sm: "p-4",
                default: "",
                lg: "p-8",
            },
            interactive: {
                true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            interactive: false,
        },
    }
)

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, size, interactive, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant, size, interactive, className }))}
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

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
