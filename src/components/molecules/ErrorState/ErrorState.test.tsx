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

  test('should show the development label when debugDetail is provided', async () => {
    // Act
    await render(<ErrorState debugDetail="HTTP 500" message="msg" onRetry={jest.fn()} title="title" />);

    // Assert — jest runs with __DEV__ true
    expect(screen.getByText('[dev] HTTP 500')).toBeTruthy();
  });

  test('should not show a development label when debugDetail is absent', async () => {
    // Act
    await render(<ErrorState message="msg" onRetry={jest.fn()} title="title" />);

    // Assert
    expect(screen.queryByText(/\[dev\]/)).toBeNull();
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
