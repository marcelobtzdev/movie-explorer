import { create } from 'zustand';

export interface NotificationStore {
  hide: () => void;
  isVisible: boolean;
  message: string | null;
  notify: (message: string) => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  hide: () => set({ isVisible: false, message: null }),
  isVisible: false,
  message: null,
  notify: (message) => set({ isVisible: true, message }),
}));

export const useNotification = () =>
  useNotificationStore((state) => ({
    hide: state.hide,
    isVisible: state.isVisible,
    message: state.message,
  }));
