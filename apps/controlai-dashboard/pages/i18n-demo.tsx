/**
 * I18n Demo Page - Testing Internationalization in ControlAI Dashboard
 * Path: /i18n-demo
 */
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import I18nDemoPage from '../components/I18nDemoPage';
import '../lib/i18n/config'; // Initialize i18n

const I18nDemo: NextPage = () => {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by ensuring component only renders on client
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 rounded-md w-1/3 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-2/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <I18nDemoPage />;
};

export default I18nDemo;