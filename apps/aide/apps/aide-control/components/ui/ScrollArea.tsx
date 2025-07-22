import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	children: React.ReactNode;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={clsx(
					'overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800',
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}
);

ScrollArea.displayName = 'ScrollArea';
