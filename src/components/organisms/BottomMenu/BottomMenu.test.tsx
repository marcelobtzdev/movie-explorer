import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { BottomMenu } from './BottomMenu';

const ITEMS = [
  { active: true, icon: '🔥', label: 'Populares' },
  { active: false, icon: '🎞️', label: 'Cartelera' },
  { active: false, icon: '⭐', label: 'Mejor Valoradas' },
  { active: false, icon: '🔖', label: 'Favoritos' },
] as const;

describe('Component: BottomMenu', () => {
  test('should render every item label', async () => {
    // Act
    await render(<BottomMenu items={ITEMS} />);

    // Assert
    expect(screen.getByText('Populares')).toBeTruthy();
    expect(screen.getByText('Cartelera')).toBeTruthy();
    expect(screen.getByText('Mejor Valoradas')).toBeTruthy();
    expect(screen.getByText('Favoritos')).toBeTruthy();
  });

  test('should expose inactive items as disabled to accessibility', async () => {
    // Act
    await render(<BottomMenu items={ITEMS} />);

    // Assert
    expect(screen.getByRole('tab', { name: 'Cartelera' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Favoritos' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Populares' })).not.toBeDisabled();
  });

  test('should not crash when an inactive item is pressed', async () => {
    // Arrange
    await render(<BottomMenu items={ITEMS} />);

    // Act / Assert
    await fireEvent.press(screen.getByRole('tab', { name: 'Favoritos' }));
    expect(screen.getByText('Populares')).toBeTruthy();
  });
});
