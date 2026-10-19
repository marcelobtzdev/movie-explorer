import { MoviesScreen } from '@/src/features/movies';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import type { RootStackParamList } from './navigation.types';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen component={MoviesScreen} name={ROUTES.MOVIES} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
