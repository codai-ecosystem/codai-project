/**
 * CODAI Mobile App - Main Entry Point
 * Cross-platform React Native application for CODAI financial ecosystem
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CodaiMobileApp from './src/CodaiMobileApp';
import { name as appName } from './app.json';

// Enable react-native-screens optimization
enableScreens();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CodaiMobileApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

AppRegistry.registerComponent(appName, () => App);

export default App;
