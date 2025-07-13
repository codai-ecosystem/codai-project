export type Locale = 'en' | 'ro';

export interface TranslationKeys {
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    submit: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    retry: string;
    confirm: string;
    yes: string;
    no: string;
    ok: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  navigation: {
    home: string;
    dashboard: string;
    profile: string;
    settings: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    help: string;
    support: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    forgotPassword: string;
    resetPassword: string;
    changePassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    rememberMe: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    createAccount: string;
    welcomeBack: string;
    welcome: string;
    checkEmail: string;
    emailSent: string;
    invalidCredentials: string;
    passwordTooWeak: string;
    emailAlreadyInUse: string;
    userNotFound: string;
    emailNotVerified: string;
    tooManyRequests: string;
    networkError: string;
    unexpectedError: string;
  };
  dashboard: {
    title: string;
    overview: string;
    analytics: string;
    reports: string;
    quickActions: string;
    recentActivity: string;
    statistics: string;
    performance: string;
    insights: string;
  };
  profile: {
    title: string;
    personalInfo: string;
    accountSettings: string;
    preferences: string;
    security: string;
    notifications: string;
    privacy: string;
    deleteAccount: string;
    updateProfile: string;
    uploadPhoto: string;
    changeAvatar: string;
  };
  settings: {
    title: string;
    general: string;
    appearance: string;
    language: string;
    theme: string;
    notifications: string;
    privacy: string;
    security: string;
    advanced: string;
    integrations: string;
    billing: string;
    subscription: string;
  };
  forms: {
    required: string;
    invalid: string;
    tooShort: string;
    tooLong: string;
    invalidEmail: string;
    passwordMismatch: string;
    weakPassword: string;
    invalidPhone: string;
    invalidUrl: string;
    invalidDate: string;
    min: string;
    max: string;
    selectOption: string;
    uploadFile: string;
    dragDropFiles: string;
    maxFileSize: string;
    allowedFormats: string;
  };
  errors: {
    pageNotFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
    networkError: string;
    timeoutError: string;
    validationError: string;
    authError: string;
    permissionDenied: string;
    resourceNotFound: string;
    conflictError: string;
    rateLimitExceeded: string;
    maintenanceMode: string;
    unexpectedError: string;
    tryAgain: string;
    contactSupport: string;
    goHome: string;
    reload: string;
  };
  notifications: {
    success: string;
    error: string;
    warning: string;
    info: string;
    profileUpdated: string;
    passwordChanged: string;
    emailVerified: string;
    settingsSaved: string;
    fileUploaded: string;
    dataExported: string;
    accountDeleted: string;
    subscriptionUpdated: string;
    paymentProcessed: string;
    invitationSent: string;
    taskCompleted: string;
    reminderSet: string;
  };
  pwa: {
    installApp: string;
    updateAvailable: string;
    updateNow: string;
    updateLater: string;
    offlineMode: string;
    backOnline: string;
    installPrompt: string;
    installDescription: string;
    workingOffline: string;
    syncWhenOnline: string;
  };
  footer: {
    copyright: string;
    allRightsReserved: string;
    builtWith: string;
    version: string;
    lastUpdated: string;
    status: string;
    documentation: string;
    changelog: string;
    feedback: string;
    contribute: string;
  };
}

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;
