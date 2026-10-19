import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Rating } from './Rating';

describe('Component: Rating', () => {
  test('should render the star and the given value', async () => {
    // Act
    await render(<Rating value="7.8" />);

    // Assert
    expect(screen.getByText('★')).toBeTruthy();
    expect(screen.getByText('7.8')).toBeTruthy();
  });

  test('should render a dash when the value is a dash', async () => {
    // Act
    await render(<Rating value="–" />);

    // Assert
    expect(screen.getByText('–')).toBeTruthy();
  });
});
