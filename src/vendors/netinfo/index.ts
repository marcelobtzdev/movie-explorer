import NetInfo from '@react-native-community/netinfo';

export const subscribeToConnectivity = (listener: (isConnected: boolean) => void) =>
  NetInfo.addEventListener((state) => {
    listener(Boolean(state.isConnected));
  });
