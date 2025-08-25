/**
 * @fileoverview Locale Middleware
 * @description Next.js middleware for locale handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../../i18n/shared-config';

const SUPPORTED_LOCALE_CODES = Object.keys(SUPPORTED_LOCALES);

/**
 * Locale detection middleware for Next.js
 */
export function localeMiddleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the pathname has a locale
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = SUPPORTED_LOCALE_CODES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Detect locale from various sources
  const detectedLocale = detectLocaleFromRequest(request);

  // Redirect to localized URL
  const localizedUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
  
  // Preserve search parameters
  localizedUrl.search = request.nextUrl.search;

  return NextResponse.redirect(localizedUrl);
}

/**
 * Detect locale from request
 */
function detectLocaleFromRequest(request: NextRequest): string {
  // 1. Check URL parameter
  const urlLocale = request.nextUrl.searchParams.get('lang');
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }

  // 2. Check cookie
  const cookieLocale = request.cookies.get('bancai_locale')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const headerLocale = detectFromAcceptLanguage(acceptLanguage);
    if (headerLocale) {
      return headerLocale;
    }
  }

  // 4. Fallback to default
  return DEFAULT_LOCALE;
}

/**
 * Parse Accept-Language header and find best match
 */
function detectFromAcceptLanguage(acceptLanguage: string): string | null {
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';q=');
      return {
        locale: locale.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    // Try exact match
    if (isValidLocale(locale)) {
      return locale;
    }
    
    // Try language-only match (e.g., 'en' from 'en-US')
    const languageOnly = locale.split('-')[0];
    if (isValidLocale(languageOnly)) {
      return languageOnly;
    }
  }

  return null;
}

/**
 * Check if locale is supported
 */
function isValidLocale(locale: string): boolean {
  return SUPPORTED_LOCALE_CODES.includes(locale);
}

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  return firstSegment && isValidLocale(firstSegment) ? firstSegment : null;
}

/**
 * Remove locale from pathname
 */
export function removeLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;
  
  const withoutLocale = pathname.replace(`/${locale}`, '') || '/';
  return withoutLocale;
}

/**
 * Add locale to pathname
 */
export function addLocaleToPathname(pathname: string, locale: string): string {
  if (!isValidLocale(locale)) return pathname;
  
  const cleanPathname = removeLocaleFromPathname(pathname);
  return `/${locale}${cleanPathname === '/' ? '' : cleanPathname}`;
}

/**
 * Custom matcher configuration for Next.js middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

/**
 * Locale-aware URL rewriter
 */
export class LocaleURLRewriter {
  private baseUrl: string;
  private defaultLocale: string;

  constructor(baseUrl: string, defaultLocale: string = DEFAULT_LOCALE) {
    this.baseUrl = baseUrl.replace(//$/, '');
    this.defaultLocale = defaultLocale;
  }

  /**
   * Rewrite URL to include locale
   */
  rewrite(url: string, locale: string): string {
    if (!isValidLocale(locale)) {
      locale = this.defaultLocale;
    }

    const urlObj = new URL(url, this.baseUrl);
    const currentLocale = getLocaleFromPathname(urlObj.pathname);

    if (currentLocale === locale) {
      return url; // Already has correct locale
    }

    // Remove current locale and add new one
    const cleanPathname = removeLocaleFromPathname(urlObj.pathname);
    urlObj.pathname = addLocaleToPathname(cleanPathname, locale);

    return urlObj.toString();
  }

  /**
   * Get canonical URL without locale
   */
  getCanonical(url: string): string {
    const urlObj = new URL(url, this.baseUrl);
    urlObj.pathname = removeLocaleFromPathname(urlObj.pathname);
    return urlObj.toString();
  }

  /**
   * Get all localized versions of a URL
   */
  getAllLocalizedVersions(url: string): Record<string, string> {
    const canonical = this.getCanonical(url);
    const result: Record<string, string> = {};

    for (const locale of SUPPORTED_LOCALE_CODES) {
      result[locale] = this.rewrite(canonical, locale);
    }

    return result;
  }
}

export default localeMiddleware;