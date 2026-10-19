import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { queryClient } from './client';

export function ReactQueryProvider({ children }: { readonly children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
