import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Text } from './Text';

describe('Component: Text', () => {
  describe('Rendering', () => {
    test('should render its children', async () => {
      // Act
      await render(<Text>Hola</Text>);

      // Assert
      expect(screen.getByText('Hola')).toBeTruthy();
    });
  });
});
