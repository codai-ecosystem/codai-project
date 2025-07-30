// Basic hooks
export { useAuth } from './useAuth';
export { useTheme } from './useTheme';
export { useNotifications } from './useNotifications';
export { usePWA } from './usePWA';
export { useFormFields } from './useFormFields';
// export { useI18n, useTranslation } from '@/contexts/I18nContext'; // TODO: Create I18nContext
export * from './common';

// Data handling hooks
export { useTableData } from './useTableData';

// Firebase-related hooks
export { useFirebaseMessaging } from './useFirebaseMessaging';
export { useAnalytics } from './useAnalytics';
export { useRemoteConfig } from './useRemoteConfig';
export { useFirestore } from './useFirestore';
export { useFirestoreTransaction } from './useFirestoreTransaction';
export { useStorage } from './useStorage';
export { useCollectionVirtualization } from './useCollectionVirtualization';
