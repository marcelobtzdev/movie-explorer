import { NetworkErrorOverlay } from '@/src/components/organisms/NetworkErrorOverlay';
import { ServerErrorOverlay } from '@/src/components/organisms/ServerErrorOverlay';
import { Toast } from '@/src/components/organisms/Toast';
import { useNetworkStatus } from '@/src/hooks/use-network-status';
import { RootNavigator } from '@/src/navigation/RootNavigator';
import { ReactNavigationProvider } from '@/src/vendors/react-navigation/ReactNavigationProvider';
import { ReactQueryProvider } from '@/src/vendors/react-query/ReactQueryProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

function AppContent() {
  useNetworkStatus();

  return (
    <>
      <RootNavigator />
      <NetworkErrorOverlay />
      <ServerErrorOverlay />
      <Toast />
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ReactQueryProvider>
        <ReactNavigationProvider>
          <AppContent />
        </ReactNavigationProvider>
      </ReactQueryProvider>
    </SafeAreaProvider>
  );
}

export default App;
