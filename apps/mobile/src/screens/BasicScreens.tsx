/**
 * Basic Screen Components - Mobile App Screens
 * Simple implementations for remaining mobile screens
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const createBasicScreen = (screenName: string, content: string) => {
  const Screen: React.FC = () => (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{screenName}</Text>
        <Text style={styles.description}>{content}</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Coming Soon</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  return Screen;
};

export const BankingScreen = createBasicScreen(
  'BANCAI Banking',
  'Comprehensive banking services with AI-powered financial insights and Romanian banking integration.'
);

export const WalletScreen = createBasicScreen(
  'Digital Wallet',
  'Secure digital wallet for cryptocurrency and traditional assets with multi-currency support.'
);

export const MemoraiScreen = createBasicScreen(
  'MEMORAI Memory Hub',
  'Advanced AI memory management with ML-powered classification and voice search capabilities.'
);

export const PortfolioScreen = createBasicScreen(
  'Portfolio Analytics',
  'Comprehensive portfolio analysis with real-time tracking and performance metrics.'
);

export const AnalyticsScreen = createBasicScreen(
  'Advanced Analytics',
  'Deep financial analytics with predictive insights and AI-powered recommendations.'
);

export const SettingsScreen = createBasicScreen(
  'Settings',
  'Customize your CODAI experience with preferences, security, and account management.'
);

export const ProfileScreen = createBasicScreen(
  'User Profile',
  'Manage your profile information, preferences, and account settings.'
);

export const SecurityScreen = createBasicScreen(
  'Security Center',
  'Advanced security features including biometric authentication and encryption settings.'
);

export const OnboardingScreen = createBasicScreen(
  'Welcome to CODAI',
  'Get started with the most advanced financial ecosystem powered by artificial intelligence.'
);

export const LoginScreen = createBasicScreen(
  'Login',
  'Secure access to your CODAI account with biometric authentication support.'
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Default exports for individual screens
export default {
  BankingScreen,
  WalletScreen,
  MemoraiScreen,
  PortfolioScreen,
  AnalyticsScreen,
  SettingsScreen,
  ProfileScreen,
  SecurityScreen,
  OnboardingScreen,
  LoginScreen,
};
