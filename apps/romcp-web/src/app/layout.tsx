/**
 * @fileoverview ROMCP Web Frontend - Root layout component
 * @author Cautai Team
 * @version 1.0.0
 */

import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { TranslationProvider } from '@codai/cautai-i18n';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <TranslationProvider>
                        {children}
                    </TranslationProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}