import { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Poster } from './Poster';

describe('Component: Poster', () => {
  describe('Rendering', () => {
    test('should render an image when a path is provided', async () => {
      // Act
      await render(
        <Poster
          height={210}
          path="/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg"
          placeholderLabel="Sin imagen"
          size={TMDB_IMAGE_SIZES.poster}
          width={140}
        />,
      );

      // Assert
      expect(screen.queryByText('Sin imagen')).toBeNull();
    });

    test('should render the placeholder when the path is null', async () => {
      // Act
      await render(
        <Poster height={210} path={null} placeholderLabel="Sin imagen" size={TMDB_IMAGE_SIZES.poster} width={140} />,
      );

      // Assert
      expect(screen.getByText('Sin imagen')).toBeTruthy();
    });

    test('should fall back to the placeholder when the image fails to load', async () => {
      // Arrange
      await render(
        <Poster
          height={210}
          path="/broken.jpg"
          placeholderLabel="Sin imagen"
          size={TMDB_IMAGE_SIZES.poster}
          width={140}
        />,
      );

      // Act
      await fireEvent(screen.getByTestId('poster-image'), 'error');

      // Assert
      expect(screen.getByText('Sin imagen')).toBeTruthy();
    });
  });
});
