import { render, screen } from '@/src/utils/test-utils';
import { Text } from 'react-native';
import React from 'react';
import { ScreenContainer } from './ScreenContainer';

describe('Component: ScreenContainer', () => {
  test('should render its children', async () => {
    // Act
    await render(
      <ScreenContainer>
        <Text>contenido</Text>
      </ScreenContainer>,
    );

    // Assert
    expect(screen.getByText('contenido')).toBeTruthy();
  });
});
