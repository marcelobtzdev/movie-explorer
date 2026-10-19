import { render } from '@/src/utils/test-utils';
import React from 'react';
import { Skeleton } from './Skeleton';

describe('Component: Skeleton', () => {
  test('should render a placeholder block by default', async () => {
    // Act
    const { toJSON } = await render(<Skeleton height={40} width={40} />);

    // Assert
    expect(toJSON()).not.toBeNull();
  });

  test('should render nothing when show is false', async () => {
    // Act
    const { toJSON } = await render(<Skeleton height={40} show={false} width={40} />);

    // Assert
    expect(toJSON()?.children ?? []).toHaveLength(0);
  });

  test('should let a Skeleton.Group control visibility of its children', async () => {
    // Act
    const { toJSON } = await render(
      <Skeleton.Group show={false}>
        <Skeleton height={40} width={40} />
      </Skeleton.Group>,
    );

    // Assert
    expect(toJSON()?.children ?? []).toHaveLength(0);
  });
});
