import { render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Chip } from './Chip';

describe('Component: Chip', () => {
  test('should render its label', async () => {
    // Act
    await render(<Chip label="Acción" />);

    // Assert
    expect(screen.getByText('Acción')).toBeTruthy();
  });
});
