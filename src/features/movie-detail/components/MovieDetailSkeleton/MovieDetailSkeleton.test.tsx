import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { MovieDetailSkeleton } from './MovieDetailSkeleton';

describe('Component: MovieDetailSkeleton', () => {
  test('should expose a single busy region with the loading label', async () => {
    // Act
    await render(<MovieDetailSkeleton />);

    // Assert
    expect(screen.getByLabelText('Cargando película')).toBeTruthy();
  });
});
