import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ROUTES } from './routes';

export type RootStackParamList = {
  [ROUTES.MOVIE_DETAIL]: { movieId: number };
  [ROUTES.MOVIES]: undefined;
};

export type MoviesScreenProps = NativeStackScreenProps<RootStackParamList, typeof ROUTES.MOVIES>;
export type MovieDetailScreenProps = NativeStackScreenProps<RootStackParamList, typeof ROUTES.MOVIE_DETAIL>;
