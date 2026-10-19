import { AppError } from '@/src/utils/app-error';
import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { useMovieDetail } from '../hooks/use-movie-detail';
import { MovieDetailScreen } from './movie-detail.screen';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({ params: { movieId: 693134 } }),
}));

jest.mock('../hooks/use-movie-detail', () => ({
  useMovieDetail: jest.fn(),
}));

const mockUseMovieDetail = useMovieDetail as jest.Mock;

const DETAIL = {
  backdropPath: '/backdrop.jpg',
  genres: [
    { genreId: 878, name: 'Ciencia ficción' },
    { genreId: 12, name: 'Aventura' },
  ],
  movieId: 693134,
  overview: 'Paul Atreides se une a los Fremen.',
  releaseDate: '2024-03-01',
  title: 'Dune: Parte Dos',
};

const detailResult = (overrides: Partial<Record<string, unknown>>) => ({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  refetch: jest.fn(),
  ...overrides,
});

describe('Screen: MovieDetailScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success', () => {
    test('should show the title, the Spanish release date, the genres and the synopsis', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ data: DETAIL }));

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByText('Dune: Parte Dos')).toBeTruthy();
      expect(screen.getByText('📅 1 de marzo de 2024')).toBeTruthy();
      expect(screen.getByText('Ciencia ficción')).toBeTruthy();
      expect(screen.getByText('Aventura')).toBeTruthy();
      expect(screen.getByText('Sinopsis')).toBeTruthy();
      expect(screen.getByText('Paul Atreides se une a los Fremen.')).toBeTruthy();
    });

    test('should keep the header and the bottom menu visible', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ data: DETAIL }));

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByText('MovieExplorer')).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Populares' })).toBeTruthy();
    });

    test('should show the placeholder when there is no backdrop image', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ data: { ...DETAIL, backdropPath: null } }));

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByText('Sin imagen')).toBeTruthy();
    });

    test('should show the empty synopsis message when the overview is empty', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ data: { ...DETAIL, overview: '' } }));

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByText('Sin sinopsis disponible.')).toBeTruthy();
    });

    test('should show the unknown date message when there is no release date', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ data: { ...DETAIL, releaseDate: null } }));

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByText('📅 Fecha no disponible')).toBeTruthy();
    });

    test('should not render a genre row when there are no genres', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ data: { ...DETAIL, genres: [] } }));

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.queryByText('Ciencia ficción')).toBeNull();
      expect(screen.queryByText('Aventura')).toBeNull();
    });
  });

  describe('Navigation', () => {
    test('should go back when the back action is pressed', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ data: DETAIL }));
      await render(<MovieDetailScreen />);

      // Act
      await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

      // Assert
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading', () => {
    test('should show the skeleton while the detail loads, with the back action still available', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(detailResult({ isLoading: true }));

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByLabelText('Cargando película')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy();
    });
  });

  describe('Error', () => {
    test('should show the error state and retry only the detail request', async () => {
      // Arrange
      const refetch = jest.fn().mockResolvedValue({ isSuccess: true });
      mockUseMovieDetail.mockReturnValue(
        detailResult({ error: new AppError({ code: 'ERR_NETWORK', message: 'offline' }), isError: true, refetch }),
      );
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByText('No pudimos cargar la película')).toBeTruthy();
      expect(screen.getByText('[dev] sin conexión')).toBeTruthy();

      // Act
      await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

      // Assert
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    test('should show the not-found message for a 404 with a way back and no retry', async () => {
      // Arrange
      mockUseMovieDetail.mockReturnValue(
        detailResult({
          error: new AppError({ code: 'ERR_BAD_REQUEST', message: 'not found', statusCode: 404 }),
          isError: true,
        }),
      );

      // Act
      await render(<MovieDetailScreen />);

      // Assert
      expect(screen.getByText('No encontramos esta película.')).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull();
      expect(screen.getAllByRole('button', { name: 'Volver' }).length).toBeGreaterThan(0);
    });
  });
});
