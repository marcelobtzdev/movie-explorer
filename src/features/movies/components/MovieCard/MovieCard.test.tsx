import type { Movie } from '@/src/features/movies/models/movie.model';
import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { MovieCard } from './MovieCard';

const BASE_MOVIE: Movie = {
  backdropPath: null,
  genreIds: [28, 12],
  movieId: 1,
  posterPath: '/poster.jpg',
  releaseYear: 2023,
  title: 'Ant-Man and the Wasp: Quantumania',
  voteAverage: 6.5,
};

describe('Component: MovieCard', () => {
  test('should render the title and the footer with year and genres', async () => {
    // Act
    await render(<MovieCard genreNames={['Acción', 'Aventura']} movie={BASE_MOVIE} />);

    // Assert
    expect(screen.getByText('Ant-Man and the Wasp: Quantumania')).toBeTruthy();
    expect(screen.getByText('2023 • Acción / Aventura')).toBeTruthy();
    expect(screen.getByText('6.5')).toBeTruthy();
  });

  test('should show a placeholder when there is no poster', async () => {
    // Act
    await render(<MovieCard genreNames={[]} movie={{ ...BASE_MOVIE, posterPath: null }} />);

    // Assert
    expect(screen.getByText('Sin imagen')).toBeTruthy();
  });

  test('should expose an accessible label with title, year and rating', async () => {
    // Act
    await render(<MovieCard genreNames={[]} movie={BASE_MOVIE} />);

    // Assert
    expect(screen.getByLabelText('Ant-Man and the Wasp: Quantumania, 2023, valoración 6.5')).toBeTruthy();
  });

  test('should use the unknown-year and unknown-rating accessibility phrasing when missing', async () => {
    // Act
    await render(<MovieCard genreNames={[]} movie={{ ...BASE_MOVIE, releaseYear: null, voteAverage: null }} />);

    // Assert
    expect(
      screen.getByLabelText('Ant-Man and the Wasp: Quantumania, año desconocido, sin valoración'),
    ).toBeTruthy();
  });

  test('should not expose a pressable role', async () => {
    // Act
    await render(<MovieCard genreNames={[]} movie={BASE_MOVIE} />);

    // Assert
    expect(screen.queryByRole('button')).toBeNull();
  });
});
