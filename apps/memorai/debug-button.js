// Debug script to test Button component imports
const React = require('react');

console.log('Testing Button component dependencies...');

try {
    // Test CVA import
    const { cva } = require('class-variance-authority');
    console.log('✅ CVA imported');

    // Test clsx and tailwind-merge
    const { clsx } = require('clsx');
    const { twMerge } = require('tailwind-merge');
    console.log('✅ clsx and twMerge imported');

    // Test cn utility (same as in utils.ts)
    const cn = (...inputs) => twMerge(clsx(inputs));
    console.log('✅ cn utility created');

    // Test buttonVariants (same as in Button component)
    const buttonVariants = cva(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
        {
            variants: {
                variant: {
                    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
                    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md'
                },
                size: {
                    default: 'h-10 px-4 py-2',
                    sm: 'h-8 rounded-md px-3 text-xs'
                }
            },
            defaultVariants: {
                variant: 'default',
                size: 'default'
            }
        }
    );
    console.log('✅ buttonVariants created');

    // Test class generation
    const defaultClasses = buttonVariants();
    console.log('Default classes:', defaultClasses);

    const secondaryClasses = buttonVariants({ variant: 'secondary' });
    console.log('Secondary classes:', secondaryClasses);

    // Test cn merging
    const merged = cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'custom-class');
    console.log('Merged classes:', merged);

} catch (error) {
    console.error('❌ Error:', error);
}
