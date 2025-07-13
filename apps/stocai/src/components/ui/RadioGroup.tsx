'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref): React.ReactElement => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref): React.ReactElement => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

// Enhanced RadioGroup with labels and descriptions
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupWithLabelsProps {
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  className?: string;
  error?: string;
  label?: string;
  description?: string;
  required?: boolean;
}

export function RadioGroupWithLabels({
  options,
  value,
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  className,
  error,
  label,
  description,
  required = false,
}: RadioGroupWithLabelsProps): React.ReactElement {
  const id = React.useId();

  return (
    <div className="space-y-3">
      {label !== undefined ? (
        <div className="space-y-1">
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required === true ? (
              <span className="ml-1 text-destructive">*</span>
            ) : null}
          </label>
          {description !== undefined && error === undefined ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <RadioGroup
        id={id}
        value={value ?? ''}
        onValueChange={onValueChange ?? (() => {})}
        disabled={disabled}
        className={cn(
          orientation === 'horizontal' ? 'flex flex-wrap gap-6' : 'grid gap-3',
          className
        )}
        aria-invalid={error !== undefined ? 'true' : 'false'}
        aria-describedby={error !== undefined ? `${id}-error` : undefined}
      >
        {options.map(option => (
          <div key={option.value} className="flex items-start space-x-3">
            <RadioGroupItem
              value={option.value}
              id={`${id}-${option.value}`}
              disabled={disabled === true || option.disabled === true}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={`${id}-${option.value}`}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  (disabled === true || option.disabled === true) &&
                    'cursor-not-allowed opacity-50'
                )}
              >
                {option.label}
              </label>
              {option.description !== undefined ? (
                <p
                  className={cn(
                    'text-xs text-muted-foreground',
                    (disabled === true || option.disabled === true) &&
                      'opacity-50'
                  )}
                >
                  {option.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </RadioGroup>
      {error !== undefined ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Card-style RadioGroup for more prominent options
interface RadioCardProps {
  option: RadioOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
  name: string;
}

function RadioCard({
  option,
  isSelected,
  onSelect,
  disabled = false,
  name,
}: RadioCardProps): React.ReactElement {
  const inputId = `${name}-${option.value}`;

  return (
    <label
      htmlFor={inputId}
      aria-label={option.label}
      className={cn(
        'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
        isSelected === true
          ? 'border-primary bg-primary/5 ring-2 ring-primary'
          : 'border-muted bg-background hover:bg-accent',
        disabled === true && 'cursor-not-allowed opacity-50'
      )}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        value={option.value}
        checked={isSelected}
        onChange={(): void => {
          if (disabled !== true) {
            onSelect(option.value);
          }
        }}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex w-full items-start">
        <div className="flex items-center">
          <div
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-full border-2',
              isSelected === true
                ? 'border-primary bg-primary'
                : 'border-muted-foreground'
            )}
          >
            {isSelected === true ? (
              <div className="h-2 w-2 rounded-full bg-background" />
            ) : null}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-foreground">
            {option.label}
          </div>
          {option.description !== undefined ? (
            <div className="mt-1 text-sm text-muted-foreground">
              {option.description}
            </div>
          ) : null}
        </div>
      </div>
    </label>
  );
}

interface RadioCardsProps {
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  label?: string;
  description?: string;
  required?: boolean;
  columns?: 1 | 2 | 3;
}

export function RadioCards({
  options,
  value,
  onValueChange,
  disabled = false,
  className,
  error,
  label,
  description,
  required = false,
  columns = 1,
}: RadioCardsProps): React.ReactElement {
  const id = React.useId();
  const name = `radio-cards-${id}`;

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className="space-y-3">
      {label !== undefined ? (
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required === true ? (
              <span className="ml-1 text-destructive">*</span>
            ) : null}
          </label>
          {description !== undefined && error === undefined ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn('grid gap-3', gridCols[columns], className)}
        role="radiogroup"
        aria-invalid={error !== undefined ? 'true' : 'false'}
        aria-describedby={error !== undefined ? `${id}-error` : undefined}
      >
        {options.map(option => (
          <RadioCard
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onSelect={onValueChange ?? (() => {})}
            disabled={disabled === true || option.disabled === true}
            name={name}
          />
        ))}
      </div>
      {error !== undefined ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
