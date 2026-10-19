import type { Movie } from '@/src/features/movies/models/movie.model';
import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { FeaturedMovieCard } from './FeaturedMovieCard';

const BASE_MOVIE: Movie = {
  backdropPath: '/backdrop.jpg',
  genreIds: [28, 12],
  movieId: 1,
  posterPath: '/poster.jpg',
  releaseYear: 2023,
  title: 'Ant-Man and the Wasp: Quantumania',
  voteAverage: 6.5,
};

describe('Component: FeaturedMovieCard', () => {
  test('should render the rating, title, genres and year without a badge label', async () => {
    // Act
    await render(<FeaturedMovieCard genreNames={['Acción', 'Aventura']} movie={BASE_MOVIE} />);

    // Assert
    expect(screen.queryByText('#1 TENDENCIA')).toBeNull();
    expect(screen.getByText('6.5')).toBeTruthy();
    expect(screen.getByText('Ant-Man and the Wasp: Quantumania')).toBeTruthy();
    expect(screen.getByText('Acción')).toBeTruthy();
    expect(screen.getByText('Aventura')).toBeTruthy();
    expect(screen.getByText('2023')).toBeTruthy();
  });

  test('should show a placeholder when there is no backdrop', async () => {
    // Act
    await render(<FeaturedMovieCard genreNames={[]} movie={{ ...BASE_MOVIE, backdropPath: null }} />);

    // Assert
    expect(screen.getByText('Sin imagen')).toBeTruthy();
  });

  test('should show a dash when the rating and year are unknown', async () => {
    // Act
    await render(
      <FeaturedMovieCard genreNames={[]} movie={{ ...BASE_MOVIE, releaseYear: null, voteAverage: null }} />,
    );

    // Assert — one dash for the unknown rating, one for the unknown year
    expect(screen.getAllByText('–')).toHaveLength(2);
  });

  test('should not expose a pressable role', async () => {
    // Act
    await render(<FeaturedMovieCard genreNames={[]} movie={BASE_MOVIE} />);

    // Assert — the card is not pressable (FR-023); no button/tab role is exposed for it
    expect(screen.queryByRole('button')).toBeNull();
  });
});
