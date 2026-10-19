import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Header } from './Header';

describe('Component: Header', () => {
  test('should render the app name and the given subtitle', async () => {
    // Act
    await render(<Header subtitle="Populares" />);

    // Assert
    expect(screen.getByText('MovieExplorer')).toBeTruthy();
    expect(screen.getByText('Populares')).toBeTruthy();
  });

  test('should not render a search icon', async () => {
    // Act
    await render(<Header subtitle="Populares" />);

    // Assert
    expect(screen.queryByRole('search')).toBeNull();
  });
});
