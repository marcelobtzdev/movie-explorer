import { render, screen } from '@/src/utils/test-utils';
import { Text } from 'react-native';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): React.ReactElement {
  throw new Error('boom');
}

describe('Component: ErrorBoundary', () => {
  test('should render its children when there is no error', async () => {
    // Act
    await render(
      <ErrorBoundary>
        <Text>contenido</Text>
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('contenido')).toBeTruthy();
  });

  test('should render a fallback message when a child throws', async () => {
    // Arrange
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('Ocurrió un error inesperado.')).toBeTruthy();

    // Cleanup
    jest.restoreAllMocks();
  });
});
