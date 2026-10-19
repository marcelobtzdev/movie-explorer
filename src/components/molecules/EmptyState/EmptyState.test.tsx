import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { EmptyState } from './EmptyState';

describe('Component: EmptyState', () => {
  test('should render the given message', async () => {
    // Act
    await render(<EmptyState message="No hay películas para mostrar" />);

    // Assert
    expect(screen.getByText('No hay películas para mostrar')).toBeTruthy();
  });
});
