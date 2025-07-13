import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
export declare function formatDate(date: Date | string): string;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function generateId(): string;
export declare function validateEmail(email: string): boolean;
export * from './constants';
export * from './types';
//# sourceMappingURL=utils.d.ts.map