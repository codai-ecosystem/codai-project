/**
 * @fileoverview Cultural Components
 * @description React components that adapt to cultural preferences
 */

import React, { ReactNode } from 'react';
import { useI18n } from './I18nProvider';
import { createCulturalFormatter, CulturalFormatter } from '../utils/cultural-formatters';
import { getCulturalPreferences } from '../utils/cultural-config';

interface CulturalTextProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Text component that applies cultural typography
 */
export const CulturalText: React.FC<CulturalTextProps> = ({
  children,
  className = '',
  style = {}
}) => {
  const { currentLocale } = useI18n();
  const preferences = getCulturalPreferences(currentLocale.code);

  const culturalStyle: React.CSSProperties = {
    fontFamily: preferences.typography.fontFamily,
    fontSize: preferences.typography.fontSize.base,
    lineHeight: preferences.typography.lineHeight.base,
    ...style
  };

  return (
    <span className={className} style={culturalStyle}>
      {children}
    </span>
  );
};

interface CulturalNumberProps {
  value: number;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

/**
 * Number component with cultural formatting
 */
export const CulturalNumber: React.FC<CulturalNumberProps> = ({
  value,
  className = '',
  minimumFractionDigits,
  maximumFractionDigits,
  useGrouping
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatNumber(value, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalCurrencyProps {
  amount: number;
  currency?: string;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Currency component with cultural formatting
 */
export const CulturalCurrency: React.FC<CulturalCurrencyProps> = ({
  amount,
  currency,
  className = '',
  minimumFractionDigits,
  maximumFractionDigits
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatCurrency(amount, currency, {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalDateProps {
  date: Date | string | number;
  className?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  includeTime?: boolean;
}

/**
 * Date component with cultural formatting
 */
export const CulturalDate: React.FC<CulturalDateProps> = ({
  date,
  className = '',
  dateStyle,
  timeStyle,
  includeTime
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatDate(date, {
    dateStyle,
    timeStyle,
    includeTime
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalTimeProps {
  time: Date | string | number;
  className?: string;
  includeSeconds?: boolean;
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

/**
 * Time component with cultural formatting
 */
export const CulturalTime: React.FC<CulturalTimeProps> = ({
  time,
  className = '',
  includeSeconds,
  timeStyle
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatTime(time, {
    includeSeconds,
    timeStyle
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalRelativeTimeProps {
  date: Date | string | number;
  className?: string;
}

/**
 * Relative time component (e.g., "2 hours ago")
 */
export const CulturalRelativeTime: React.FC<CulturalRelativeTimeProps> = ({
  date,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatRelativeTime(date);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalPercentageProps {
  value: number;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Percentage component with cultural formatting
 */
export const CulturalPercentage: React.FC<CulturalPercentageProps> = ({
  value,
  className = '',
  minimumFractionDigits,
  maximumFractionDigits
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatPercentage(value, {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalPhoneProps {
  phoneNumber: string;
  className?: string;
}

/**
 * Phone number component with cultural formatting
 */
export const CulturalPhone: React.FC<CulturalPhoneProps> = ({
  phoneNumber,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatPhoneNumber(phoneNumber);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalNameProps {
  firstName: string;
  lastName: string;
  honorific?: string;
  className?: string;
}

/**
 * Name component with cultural formatting
 */
export const CulturalName: React.FC<CulturalNameProps> = ({
  firstName,
  lastName,
  honorific,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatName(firstName, lastName, honorific);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalAddressProps {
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
  };
  className?: string;
}

/**
 * Address component with cultural formatting
 */
export const CulturalAddress: React.FC<CulturalAddressProps> = ({
  address,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatAddress(address);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalCalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Calendar component with cultural preferences
 */
export const CulturalCalendar: React.FC<CulturalCalendarProps> = ({
  className = '',
  onDateSelect,
  selectedDate,
  minDate,
  maxDate
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);
  const preferences = getCulturalPreferences(currentLocale.code);

  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return (firstDay - preferences.weekStart + 7) % 7;
  };

  const getDayNames = () => {
    const days = [];
    const baseDate = new Date(2024, 0, preferences.weekStart); // Start from the week start day
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(baseDate);
      day.setDate(baseDate.getDate() + i);
      days.push(formatter.formatDate(day, { weekday: 'short' }));
    }
    
    return days;
  };

  const isWeekend = (dayOfWeek: number) => {
    return formatter.isWeekend(dayOfWeek);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOffset = getFirstDayOfMonth(currentMonth);
  const dayNames = getDayNames();

  const days = [];
  
  // Empty cells for offset
  for (let i = 0; i < firstDayOffset; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={`cultural-calendar ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ‹
        </button>
        <h3 className="text-lg font-semibold">
          {formatter.formatDate(currentMonth, { year: 'numeric', month: 'long' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-600 p-2">
            {dayName}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2"></div>;
          }
          
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dayOfWeek = date.getDay();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
          const isWeekendDay = isWeekend(dayOfWeek);
          
          return (
            <button
              key={day}
              onClick={() => !isDisabled && onDateSelect?.(date)}
              disabled={isDisabled}
              className={`
                p-2 text-center rounded hover:bg-blue-50 transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : ''}
                ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900'}
                ${isWeekendDay ? 'text-red-600' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface CulturalContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container that applies cultural styling preferences
 */
export const CulturalContainer: React.FC<CulturalContainerProps> = ({
  children,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const preferences = getCulturalPreferences(currentLocale.code);

  const containerStyle: React.CSSProperties = {
    '--cultural-primary': preferences.colors.primary,
    '--cultural-secondary': preferences.colors.secondary,
    '--cultural-danger': preferences.colors.danger,
    '--cultural-warning': preferences.colors.warning,
    '--cultural-success': preferences.colors.success,
    fontFamily: preferences.typography.fontFamily
  } as React.CSSProperties;

  return (
    <div 
      className={`cultural-container ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default {
  CulturalText,
  CulturalNumber,
  CulturalCurrency,
  CulturalDate,
  CulturalTime,
  CulturalRelativeTime,
  CulturalPercentage,
  CulturalPhone,
  CulturalName,
  CulturalAddress,
  CulturalCalendar,
  CulturalContainer
};