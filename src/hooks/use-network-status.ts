import { APP_STRINGS } from '@/src/constants/strings';
import { useNetworkErrorStore } from '@/src/stores/error-overlay-store';
import { useNotificationStore } from '@/src/stores/notification-store';
import { subscribeToConnectivity } from '@/src/vendors/netinfo';
import { queryClient } from '@/src/vendors/react-query/client';
import { useEffect, useRef } from 'react';

export const useNetworkStatus = () => {
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToConnectivity((isConnected) => {
      if (!isConnected) {
        wasOfflineRef.current = true;
        return;
      }

      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;

        if (useNetworkErrorStore.getState().isVisible) {
          useNetworkErrorStore.getState().hide();
        }

        queryClient.invalidateQueries().catch(() => {});
        useNotificationStore.getState().notify(APP_STRINGS.networkRestoredToast);
      }
    });

    return unsubscribe;
  }, []);
};
