import { render } from '@/src/utils/test-utils';
import React from 'react';
import App from './App';

describe('App', () => {
  test('should render without throwing', async () => {
    // Act / Assert
    await render(<App />);
  });
});
