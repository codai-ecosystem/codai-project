import React from 'react';

export interface SwitchProps {
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onValueChange?: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-labelledby'?: string;
    className?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({
        id,
        checked,
        defaultChecked,
        onValueChange,
        disabled,
        className,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedBy,
        'aria-labelledby': ariaLabelledBy,
        ...props
    }, ref) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onValueChange?.(event.target.checked);
        };

        return (
            <div className={`relative inline-block w-11 h-6 ${className || ''}`}>
                <input
                    ref={ref}
                    type="checkbox"
                    id={id}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-describedby={ariaDescribedBy}
                    aria-labelledby={ariaLabelledBy}
                    className="sr-only peer"
                    {...props}
                />
                <label
                    htmlFor={id}
                    className={`
            block w-full h-full bg-gray-300 rounded-full cursor-pointer transition-colors
            peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full 
            after:h-5 after:w-5 after:transition-transform after:duration-200 after:ease-in-out
            peer-checked:after:translate-x-5
          `}
                />
            </div>
        );
    }
);

Switch.displayName = 'Switch';
