import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { RootNavigator } from './RootNavigator';

jest.mock('@/src/features/movies', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  return { MoviesScreen: () => <RNText>Movies screen</RNText> };
});

jest.mock('@/src/features/movie-detail', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  return { MovieDetailScreen: () => <RNText>Detail screen</RNText> };
});

describe('Navigation: RootNavigator', () => {
  test('should render the movies screen as the initial route', async () => {
    // Act
    await render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>,
    );

    // Assert
    expect(screen.getByText('Movies screen')).toBeTruthy();
    expect(screen.queryByText('Detail screen')).toBeNull();
  });
});
