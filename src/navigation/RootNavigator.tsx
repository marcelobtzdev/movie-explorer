import { MovieDetailScreen } from '@/src/features/movie-detail';
import { MoviesScreen } from '@/src/features/movies';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import type { RootStackParamList } from './navigation.types';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={MoviesScreen} name={ROUTES.MOVIES} />
      <Stack.Screen component={MovieDetailScreen} name={ROUTES.MOVIE_DETAIL} />
    </Stack.Navigator>
  );
}
