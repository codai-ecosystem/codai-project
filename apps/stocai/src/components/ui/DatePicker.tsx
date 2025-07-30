'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { format, isValid, parse } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { JSX } from 'react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';

// Calendar component for date selection
interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[] | { from: Date; to?: Date } | undefined;
  onSelect?: (
    date: Date | Date[] | { from: Date; to?: Date } | undefined
  ) => void;
  disabled?: (date: Date) => boolean;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  className?: string;
}

function Calendar({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  minDate,
  maxDate,
  className,
}: CalendarProps): JSX.Element {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selected) return false;

    if (mode === 'single') {
      return (
        selected instanceof Date &&
        date.toDateString() === selected.toDateString()
      );
    }

    if (mode === 'multiple') {
      return (
        Array.isArray(selected) &&
        selected.some(d => d.toDateString() === date.toDateString())
      );
    }

    // mode === 'range'
    const range = selected as { from: Date; to?: Date } | undefined;
    if (!range) return false;
    if (range.to === undefined)
      return date.toDateString() === range.from.toDateString();
    return date >= range.from && date <= range.to;
  };

  const isDateDisabled = (date: Date): boolean => {
    if (disabled?.(date) === true) return true;
    if (minDate !== undefined && date < minDate) return true;
    if (maxDate !== undefined && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date: Date): void => {
    if (isDateDisabled(date) === true) return;

    if (mode === 'single') {
      onSelect?.(date);
    } else if (mode === 'multiple') {
      const currentSelected = selected as Date[] | undefined;
      if (!currentSelected) {
        onSelect?.([date]);
        return;
      }
      const isSelected = currentSelected.some(
        d => d.toDateString() === date.toDateString()
      );

      if (isSelected === true) {
        onSelect?.(
          currentSelected.filter(d => d.toDateString() !== date.toDateString())
        );
      } else {
        onSelect?.([...currentSelected, date]);
      }
    } else {
      // mode === 'range'
      const currentRange = selected as { from: Date; to?: Date } | undefined;
      if (!currentRange) {
        onSelect?.({ from: date });
        return;
      }
      if (currentRange.to !== undefined) {
        onSelect?.({ from: date });
      } else if (date >= currentRange.from) {
        onSelect?.({ from: currentRange.from, to: date });
      } else {
        onSelect?.({ from: date, to: currentRange.from });
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={cn('p-3', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days */}
      <div className="mb-2 grid grid-cols-7">
        {weekDays.map(day => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <Button
                variant={isDateSelected(date) ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-full w-full p-0 font-normal',
                  isDateSelected(date) && 'bg-primary text-primary-foreground',
                  isDateDisabled(date) &&
                  'cursor-not-allowed text-muted-foreground opacity-50'
                )}
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date)}
                aria-label={format(date, 'MMMM d, yyyy')}
              >
                {date.getDate()}
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// Popover components using Radix primitives
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
      className
    )}
    {...props}
  />
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  className?: string;
  error?: string;
  label?: string;
  description?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  minDate,
  maxDate,
  format: dateFormat = 'MMM dd, yyyy',
  className,
  error,
  label,
  description,
}: DatePickerProps): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    value !== undefined ? format(value, dateFormat) : ''
  );

  // Update input value when external value changes
  React.useEffect(() => {
    setInputValue(value !== undefined ? format(value, dateFormat) : '');
  }, [value, dateFormat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the input value
    try {
      const parsedDate = parse(newValue, dateFormat, new Date());
      if (isValid(parsedDate) === true) {
        onChange?.(parsedDate);
      }
    } catch {
      // Invalid date format, ignore
    }
  };

  const handleInputBlur = (): void => {
    // Reset to valid value if input is invalid
    if (value !== undefined) {
      setInputValue(format(value, dateFormat));
    } else {
      setInputValue('');
    }
  };
  const handleDateSelect = (
    date: Date | Date[] | { from: Date; to?: Date } | undefined
  ): void => {
    if (date instanceof Date) {
      onChange?.(date);
      setOpen(false);
    } else if (date === undefined) {
      onChange?.(undefined);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {label !== undefined && label !== '' ? (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pr-10', className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
          onClick={() => setOpen(!open)}
          disabled={disabled}
          aria-label="Open calendar"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
        {open ? (
          <div className="absolute left-0 top-full z-50 mt-1">
            <div className="rounded-md border bg-popover text-popover-foreground shadow-md">
              {' '}
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateSelect}
                disabled={date => {
                  if (minDate != null && date < minDate) return true;
                  if (maxDate != null && date > maxDate) return true;
                  return false;
                }}
                {...(minDate != null && { minDate })}
                {...(maxDate != null && { maxDate })}
              />
            </div>
          </div>
        ) : null}
      </div>

      {description !== undefined &&
        description !== '' &&
        (error === undefined || error === '') ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {error !== undefined && error !== '' ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

// Range Date Picker
interface DateRangePickerProps {
  value?: { from: Date; to?: Date };
  onChange?: (range: { from: Date; to?: Date } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  error?: string;
  label?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  disabled = false,
  minDate,
  maxDate,
  className,
  error,
  label,
}: DateRangePickerProps): JSX.Element {
  const [open, setOpen] = React.useState(false);

  const formatRange = (
    range: { from: Date; to?: Date } | undefined
  ): string => {
    if (!range) return '';
    if (range.to === undefined) return format(range.from, 'MMM dd, yyyy');
    return `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="space-y-2">
      {label !== undefined && label !== '' ? (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            value?.from === undefined && 'text-muted-foreground',
            className
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value !== undefined ? formatRange(value) : placeholder}
        </Button>

        {open ? (
          <div className="absolute left-0 top-full z-50 mt-1">
            <div className="rounded-md border bg-popover text-popover-foreground shadow-md">
              {' '}
              <Calendar
                mode="range"
                selected={value}
                onSelect={range => {
                  onChange?.(range as { from: Date; to?: Date });
                  // Close popover when both dates are selected (complete range)
                  if (
                    range &&
                    typeof range === 'object' &&
                    !Array.isArray(range) &&
                    !(range instanceof Date) &&
                    'from' in range &&
                    'to' in range
                  ) {
                    // TypeScript knows this is a range object, check if complete
                    const rangeObj = range as { from: Date; to?: Date };
                    if (rangeObj.to) {
                      setOpen(false);
                    }
                  }
                }}
                disabled={date => {
                  if (minDate !== undefined && date < minDate) return true;
                  if (maxDate !== undefined && date > maxDate) return true;
                  return false;
                }}
                {...(minDate !== undefined && { minDate })}
                {...(maxDate !== undefined && { maxDate })}
              />
            </div>
          </div>
        ) : null}
      </div>

      {error !== undefined && error !== '' ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

export { Calendar };
