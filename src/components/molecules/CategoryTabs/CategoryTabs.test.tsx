import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { CategoryTabs } from './CategoryTabs';

const ITEMS = [
  { active: true, label: 'Populares' },
  { active: false, label: 'Mejor Valoradas' },
  { active: false, label: 'En Cartelera' },
] as const;

describe('Component: CategoryTabs', () => {
  test('should render every tab label', async () => {
    // Act
    await render(<CategoryTabs items={ITEMS} />);

    // Assert
    expect(screen.getByText('Populares')).toBeTruthy();
    expect(screen.getByText('Mejor Valoradas')).toBeTruthy();
    expect(screen.getByText('En Cartelera')).toBeTruthy();
  });

  test('should expose inactive tabs as disabled to accessibility', async () => {
    // Act
    await render(<CategoryTabs items={ITEMS} />);

    // Assert
    expect(screen.getByRole('tab', { name: 'Mejor Valoradas' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'En Cartelera' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Populares' })).not.toBeDisabled();
  });

  test('should do nothing when an inactive tab is pressed', async () => {
    // Arrange
    await render(<CategoryTabs items={ITEMS} />);

    // Act / Assert — disabled Pressables simply do not fire onPress; this just confirms no crash
    await fireEvent.press(screen.getByRole('tab', { name: 'Mejor Valoradas' }));
    expect(screen.getByText('Populares')).toBeTruthy();
  });
});
