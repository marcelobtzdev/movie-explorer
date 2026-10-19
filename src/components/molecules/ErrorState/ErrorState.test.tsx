import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { ErrorState } from './ErrorState';

describe('Component: ErrorState', () => {
  test('should render the title, message and a Reintentar action', async () => {
    // Act
    await render(
      <ErrorState message="Revisa tu conexión e inténtalo de nuevo." onRetry={jest.fn()} title="No pudimos cargar las películas" />,
    );

    // Assert
    expect(screen.getByText('No pudimos cargar las películas')).toBeTruthy();
    expect(screen.getByText('Revisa tu conexión e inténtalo de nuevo.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });

  test('should call onRetry when the action is pressed', async () => {
    // Arrange
    const onRetry = jest.fn();
    await render(<ErrorState message="msg" onRetry={onRetry} title="title" />);

    // Act
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
