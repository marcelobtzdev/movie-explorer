import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, type RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

const TEST_SAFE_AREA_FRAME = { height: 844, width: 390, x: 0, y: 0 };
const TEST_SAFE_AREA_INSETS = { bottom: 34, left: 0, right: 0, top: 47 };

const createWrapper = () => {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={{ frame: TEST_SAFE_AREA_FRAME, insets: TEST_SAFE_AREA_INSETS }}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    );
  };
};

// @testing-library/react-native@14's `render` is async (resolves to the RenderResult);
// every call site must `await render(...)`.
export const render = (ui: ReactElement, options?: RenderOptions) =>
  rtlRender(ui, { wrapper: createWrapper(), ...options });

export {
  act,
  fireEvent,
  renderHook,
  screen,
  userEvent,
  waitFor,
  within,
} from '@testing-library/react-native';
