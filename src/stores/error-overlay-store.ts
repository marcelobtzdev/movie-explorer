import { create } from 'zustand';

const MAX_RETRIES = 3;

export interface ErrorOverlayStore {
  hide: () => void;
  isExhausted: boolean;
  isRetrying: boolean;
  isVisible: boolean;
  refetch: (() => void) | null;
  retry: () => void;
  retryCount: number;
  show: (refetch: () => void) => void;
}

const initialState = {
  isExhausted: false,
  isRetrying: false,
  isVisible: false,
  refetch: null,
  retryCount: 0,
};

export const createErrorOverlayStore = () =>
  create<ErrorOverlayStore>()((set, get) => ({
    ...initialState,
    hide: () => set(() => ({ ...initialState })),
    retry: () => {
      const { refetch, retryCount } = get();
      const nextRetryCount = retryCount + 1;

      set({
        isExhausted: nextRetryCount >= MAX_RETRIES,
        isRetrying: true,
        retryCount: nextRetryCount,
      });

      refetch?.();
    },
    show: (refetch) =>
      set((state) => ({
        isRetrying: state.isVisible ? false : state.isRetrying,
        isVisible: true,
        refetch,
      })),
  }));

export const useNetworkErrorStore = createErrorOverlayStore();
export const useServerErrorStore = createErrorOverlayStore();
