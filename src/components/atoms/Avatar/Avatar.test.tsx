import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Avatar } from './Avatar';

describe('Component: Avatar', () => {
  test('should render the given initial', async () => {
    // Act
    await render(<Avatar initial="M" />);

    // Assert
    expect(screen.getByText('M', { includeHiddenElements: true })).toBeTruthy();
  });
});
