'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { JSX } from 'react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

export interface ComboBoxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboBoxProps {
  options: ComboBoxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
  error?: string;
  label?: string;
  description?: string;
}

export function ComboBox({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No options found',
  disabled = false,
  clearable = false,
  searchable = true,
  multiple = false,
  className,
  error,
  label,
  description,
}: ComboBoxProps): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    multiple === true
      ? Array.isArray(value)
        ? value
        : value !== undefined
          ? [value]
          : []
      : value !== undefined
        ? [value]
        : []
  );

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(
      option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Handle option selection
  const handleSelect = (optionValue: string): void => {
    if (multiple === true) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];

      setSelectedValues(newValues);
      onValueChange?.(newValues.join(','));
    } else {
      setSelectedValues([optionValue]);
      onValueChange?.(optionValue);
      setOpen(false);
    }
    setSearchQuery('');
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedValues([]);
    onValueChange?.(multiple === true ? '' : '');
    setSearchQuery('');
  };

  // Get display value
  const getDisplayValue = (): string => {
    if (selectedValues.length === 0) return placeholder;

    if (multiple === true) {
      if (selectedValues.length === 1) {
        const selectedValue = selectedValues[0]; // This should now be a string
        const option = options.find(opt => opt.value === selectedValue);
        if (option !== undefined && typeof option.label === 'string') {
          return option.label;
        }
        return selectedValue as string;
      }
      return `${selectedValues.length} selected`;
    }

    const selectedValue = selectedValues[0]; // This should now be a string
    const option = options.find(opt => opt.value === selectedValue);
    if (option !== undefined && typeof option.label === 'string') {
      return option.label;
    }
    return selectedValue as string;
  };

  // Check if option is selected
  const isOptionSelected = (optionValue: string): boolean => {
    return selectedValues.includes(optionValue);
  };

  return (
    <div className="space-y-2">
      {label !== undefined ? (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              selectedValues.length === 0 && 'text-muted-foreground',
              error !== undefined &&
              'border-destructive focus-visible:ring-destructive',
              className
            )}
            disabled={disabled}
          >
            <span className="truncate">{getDisplayValue()}</span>
            <div className="flex items-center gap-1">
              {clearable === true && selectedValues.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={handleClear}
                  aria-label="Clear selection"
                >
                  <X className="h-3 w-3" />
                </Button>
              ) : null}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <div className="flex flex-col">
            {searchable === true ? (
              <div className="border-b p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            ) : null}

            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <div className="p-1">
                  {filteredOptions.map(option => {
                    const isSelected = isOptionSelected(option.value);

                    return (
                      <Button
                        key={option.value}
                        variant="ghost"
                        className={cn(
                          'w-full justify-start font-normal',
                          isSelected === true && 'bg-accent',
                          option.disabled === true &&
                          'cursor-not-allowed opacity-50'
                        )}
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                      >
                        <div className="flex w-full items-center">
                          {multiple === true ? (
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                isSelected === true
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground'
                              )}
                            >
                              {isSelected === true ? (
                                <Check className="h-3 w-3" />
                              ) : null}
                            </div>
                          ) : null}

                          <div className="flex-1 text-left">
                            <div className="truncate">{option.label}</div>
                            {option.description !== undefined ? (
                              <div className="truncate text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            ) : null}
                          </div>

                          {multiple !== true && isSelected === true ? (
                            <Check className="ml-2 h-4 w-4" />
                          ) : null}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {description !== undefined && error === undefined ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {error !== undefined ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

// Multi-select variant with chips display
export interface MultiSelectProps extends Omit<ComboBoxProps, 'multiple'> {
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  values = [],
  onValuesChange,
  maxDisplay = 3,
  placeholder = 'Select options...',
  className,
  error,
  label,
  description,
  ...props
}: MultiSelectProps): JSX.Element {
  const [open, setOpen] = React.useState(false);

  const handleValueChange = (value: string): void => {
    const valueArray = value !== '' ? value.split(',') : [];
    onValuesChange?.(valueArray);
  };

  const removeValue = (valueToRemove: string, e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const newValues = values.filter(v => v !== valueToRemove);
    onValuesChange?.(newValues);
  };

  const getSelectedOptions = (): ComboBoxOption[] => {
    return options.filter(option => values.includes(option.value));
  };

  const getDisplayContent = (): JSX.Element | JSX.Element[] => {
    const selectedOptions = getSelectedOptions();

    if (selectedOptions.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    const displayOptions = selectedOptions.slice(0, maxDisplay);
    const remainingCount = selectedOptions.length - maxDisplay;

    return (
      <div className="flex flex-wrap gap-1">
        {displayOptions.map(option => (
          <div
            key={option.value}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground"
          >
            <span className="max-w-24 truncate">{option.label}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-secondary/80"
              onClick={(e: React.MouseEvent): void =>
                removeValue(option.value, e)
              }
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">
            +{remainingCount} more
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label !== undefined ? (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'h-auto min-h-10 w-full justify-between py-2 font-normal',
              values.length === 0 && 'text-muted-foreground',
              error !== undefined &&
              'border-destructive focus-visible:ring-destructive',
              className
            )}
          >
            <div className="flex-1 overflow-hidden text-left">
              {getDisplayContent()}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <ComboBox
            {...props}
            options={options}
            value={values.join(',')}
            onValueChange={handleValueChange}
            multiple
            placeholder={placeholder}
          />
        </PopoverContent>
      </Popover>

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
