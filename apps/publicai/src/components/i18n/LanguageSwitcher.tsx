import type { JSX } from 'react';

interface LanguageSwitcherProps {
    mode?: 'dropdown' | 'inline';
}

export function LanguageSwitcher({ mode = 'inline' }: LanguageSwitcherProps): JSX.Element {
    return (
        <div className="text-sm text-muted-foreground">
            EN
        </div>
    );
}
