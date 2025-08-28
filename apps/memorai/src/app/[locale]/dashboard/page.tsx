import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'dashboard' });
 
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            
            {/* Theme toggle in header */}
            <div className="flex items-center gap-4">
              <ThemeToggle variant="button" size="md" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-foreground">
              {t('totalMemories')}
            </h3>
            <p className="text-3xl font-bold text-primary mt-2">
              42
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t('stats.todayMemories', { count: 3 })}</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-foreground">
              {t('recentMemories')}
            </h3>
            <p className="text-3xl font-bold text-success mt-2">
              12
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t('stats.weekMemories', { count: 8 })}</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-foreground">
              {t('memoryGrowth')}
            </h3>
            <p className="text-3xl font-bold text-info mt-2">
              +15%
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t('stats.monthMemories', { count: 28 })}</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-foreground">
              Today's Activity
            </h3>
            <p className="text-3xl font-bold text-warning mt-2">
              5
            </p>
            <p className="text-sm text-muted-foreground mt-1">New insights generated</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t('quickActions')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="flex items-center justify-center px-4 py-3"
              variant="primary"
              leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>}
            >
              {t('createMemory')}
            </Button>

            <Button 
              className="flex items-center justify-center px-4 py-3"
              variant="secondary"
              leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>}
            >
              {t('searchMemories')}
            </Button>

            <Button 
              className="flex items-center justify-center px-4 py-3"
              variant="success"
              leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>}
            >
              {t('viewAnalytics')}
            </Button>

            <Button 
              className="flex items-center justify-center px-4 py-3"
              variant="warning"
              leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>}
            >
              {t('exportData')}
            </Button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t('welcomeMessage')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('noMemories')} {t('getStarted')}
          </p>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}