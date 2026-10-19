import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { LoadingIndicator } from './LoadingIndicator';

describe('Component: LoadingIndicator', () => {
  test('should expose an accessible label describing the loading state', async () => {
    // Act
    await render(<LoadingIndicator />);

    // Assert
    expect(screen.getByLabelText('Cargando')).toBeTruthy();
  });
});
