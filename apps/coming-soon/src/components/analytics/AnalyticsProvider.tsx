import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Google Analytics Configuration
export const GoogleAnalytics: React.FC<{ measurementId: string }> = ({ measurementId }) => {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('config', measurementId, {
          page_path: url,
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, measurementId]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
              cookie_flags: 'SameSite=Strict;Secure',
              custom_map: {
                'custom_dimension_1': 'user_engagement_level',
                'custom_dimension_2': 'preferred_language',
                'custom_dimension_3': 'theme_preference',
                'custom_dimension_4': 'device_type',
                'custom_dimension_5': 'page_category'
              }
            });
          `,
        }}
      />
    </>
  );
};

// Google Tag Manager Configuration
export const GoogleTagManager: React.FC<{ gtmId: string }> = ({ gtmId }) => {
  return (
    <>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
};

// Facebook Pixel Configuration
export const FacebookPixel: React.FC<{ pixelId: string }> = ({ pixelId }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).fbq = function (...args: any[]) {
        (window as any).fbq.callMethod ?
          (window as any).fbq.callMethod(...args) :
          (window as any).fbq.queue.push(...args);
      };
      if (!(window as any)._fbq) (window as any)._fbq = (window as any).fbq;
      (window as any).fbq.push = (window as any).fbq;
      (window as any).fbq.loaded = true;
      (window as any).fbq.version = '2.0';
      (window as any).fbq.queue = [];
    }
  }, []);

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
};

// LinkedIn Insight Tag
export const LinkedInInsight: React.FC<{ partnerId: string }> = ({ partnerId }) => {
  return (
    <Script
      id="linkedin-insight"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          _linkedin_partner_id = "${partnerId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);})(window.lintrk);
        `,
      }}
    />
  );
};

// Hotjar Configuration  
export const Hotjar: React.FC<{ hjid: number; hjsv: number }> = ({ hjid, hjsv }) => {
  return (
    <Script
      id="hotjar"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${hjid},hjsv:${hjsv}};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
      }}
    />
  );
};

// Microsoft Clarity Configuration
export const MicrosoftClarity: React.FC<{ projectId: string }> = ({ projectId }) => {
  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
        `,
      }}
    />
  );
};

// Comprehensive Analytics Provider
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const linkedinId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  const hotjarVersion = process.env.NEXT_PUBLIC_HOTJAR_VERSION;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  return (
    <>
      {gaId && <GoogleAnalytics measurementId={gaId} />}
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {fbPixelId && <FacebookPixel pixelId={fbPixelId} />}
      {linkedinId && <LinkedInInsight partnerId={linkedinId} />}
      {hotjarId && hotjarVersion && (
        <Hotjar hjid={parseInt(hotjarId)} hjsv={parseInt(hotjarVersion)} />
      )}
      {clarityId && <MicrosoftClarity projectId={clarityId} />}
      {children}
    </>
  );
};

// Event tracking utilities
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      custom_dimension_1: 'high_engagement',
      custom_dimension_5: category
    });
  }

  // Facebook Pixel event tracking
  if (typeof window !== 'undefined' && 'fbq' in window) {
    (window as any).fbq('track', 'CustomEvent', {
      event_action: action,
      event_category: category,
      event_label: label,
      value: value
    });
  }

  // LinkedIn conversion tracking
  if (typeof window !== 'undefined' && 'lintrk' in window) {
    (window as any).lintrk('track', { conversion_id: action });
  }
};

// Page view tracking
export const trackPageView = (url: string, title: string, category?: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
      custom_dimension_5: category || 'general'
    });
  }

  // Facebook Pixel page view
  if (typeof window !== 'undefined' && 'fbq' in window) {
    (window as any).fbq('track', 'PageView', {
      page_url: url,
      page_title: title,
      page_category: category
    });
  }
};

// User engagement tracking
export const trackEngagement = (engagement_time: number, scroll_depth: number) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'engagement_time', {
      engagement_time_msec: engagement_time,
      custom_dimension_1: scroll_depth > 75 ? 'high_engagement' : 'medium_engagement'
    });

    (window as any).gtag('event', 'scroll', {
      scroll_depth_percent: scroll_depth,
      custom_dimension_1: scroll_depth > 90 ? 'very_high_engagement' :
        scroll_depth > 50 ? 'high_engagement' : 'medium_engagement'
    });
  }
};

// Conversion tracking
export const trackConversion = (conversion_type: string, value?: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
      value: value,
      currency: currency,
      conversion_type: conversion_type
    });
  }

  // Facebook conversion
  if (typeof window !== 'undefined' && 'fbq' in window) {
    (window as any).fbq('track', 'Lead', {
      content_name: conversion_type,
      value: value,
      currency: currency
    });
  }

  // LinkedIn conversion
  if (typeof window !== 'undefined' && 'lintrk' in window) {
    (window as any).lintrk('track', {
      conversion_id: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_ID,
      conversion_value: value
    });
  }
};

// Performance monitoring
export const trackPerformance = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      // Core Web Vitals tracking
      if ('web-vitals' in window) {
        (window as any)['web-vitals'].getCLS(trackWebVital);
        (window as any)['web-vitals'].getFID(trackWebVital);
        (window as any)['web-vitals'].getFCP(trackWebVital);
        (window as any)['web-vitals'].getLCP(trackWebVital);
        (window as any)['web-vitals'].getTTFB(trackWebVital);
      }

      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        trackEvent('page_timing', 'performance', 'dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        trackEvent('page_timing', 'performance', 'load_complete', navigation.loadEventEnd - navigation.loadEventStart);
      }
    });
  }
};

const trackWebVital = (metric: any) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      custom_dimension_1: metric.value > metric.rating ? 'poor' : 'good'
    });
  }
};