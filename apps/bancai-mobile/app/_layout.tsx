import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Providers } from '../components/Providers';
import { useLogAI, setupGlobalErrorHandling } from '@codai/logai-integration'

import '../styles/global.css';

export default function RootLayout() {
  // Initialize LogAI integration for mobile
  const { logEvent, logError, logUserAction } = useLogAI()
  
  useEffect(() => {
    // Setup error handling for React Native
    setupGlobalErrorHandling('bancai-mobile')
    
    // Log mobile app initialization
    logEvent('mobile_app_initialized', {
      service: 'bancai-mobile',
      platform: Platform.OS,
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    })
  }, [])

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <StatusBar style="auto" />
    </Providers>
  );
}
