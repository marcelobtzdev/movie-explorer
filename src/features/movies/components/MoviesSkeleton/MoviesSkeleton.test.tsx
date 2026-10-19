import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { MoviesSkeleton } from './MoviesSkeleton';

describe('Component: MoviesSkeleton', () => {
  test('should render as a single accessible busy region labeled Cargando películas', async () => {
    // Act
    await render(<MoviesSkeleton />);

    // Assert
    expect(screen.getByLabelText('Cargando películas')).toBeTruthy();
  });

  test('should render without crashing (tab, featured, section-title and grid placeholder blocks)', async () => {
    // Act
    const { toJSON } = await render(<MoviesSkeleton />);

    // Assert
    expect(toJSON()).not.toBeNull();
  });
});
