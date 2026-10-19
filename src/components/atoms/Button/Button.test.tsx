import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Button } from './Button';

describe('Component: Button', () => {
  describe('Rendering', () => {
    test('should render its label', async () => {
      // Act
      await render(<Button label="Reintentar" onPress={jest.fn()} />);

      // Assert
      expect(screen.getByText('Reintentar')).toBeTruthy();
    });

    test('should expose an accessible role and label', async () => {
      // Act
      await render(<Button label="Reintentar" onPress={jest.fn()} />);

      // Assert
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    test('should call onPress when pressed', async () => {
      // Arrange
      const onPress = jest.fn();
      await render(<Button label="Reintentar" onPress={onPress} />);

      // Act
      await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

      // Assert
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
