import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-6 w-6',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, ...props }, ref): React.ReactElement => (
    <div
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

const AvatarImage = forwardRef<
  HTMLImageElement,
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: string;
    width?: number;
    height?: number;
  }
>(
  (
    { className, alt = '', src, width = 40, height = 40, ...props },
    ref
  ): React.ReactElement | null => {
    if (src === undefined || src === '') return null;

    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium',
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback, AvatarImage };
