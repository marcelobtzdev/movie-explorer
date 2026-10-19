import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ROUTES } from './routes';

export type RootStackParamList = Record<typeof ROUTES.MOVIES, undefined>;

export type MoviesScreenProps = NativeStackScreenProps<RootStackParamList, typeof ROUTES.MOVIES>;
