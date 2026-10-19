import { act, renderHook } from '@/src/utils/test-utils';
import { useDebouncedValue } from './use-debounced-value';

describe('Hook: useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should return the initial value immediately', async () => {
    // Act
    const { result } = await renderHook(() => useDebouncedValue('dune', 300));

    // Assert
    expect(result.current).toBe('dune');
  });

  test('should update only after the delay has passed without changes', async () => {
    // Arrange
    const { rerender, result } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'd' },
    });

    // Act
    await rerender({ value: 'du' });
    await act(() => {
      jest.advanceTimersByTime(299);
    });

    // Assert
    expect(result.current).toBe('d');

    // Act
    await act(() => {
      jest.advanceTimersByTime(1);
    });

    // Assert
    expect(result.current).toBe('du');
  });

  test('should restart the delay on every change', async () => {
    // Arrange
    const { rerender, result } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });

    // Act
    await rerender({ value: 'ab' });
    await act(() => {
      jest.advanceTimersByTime(200);
    });
    await rerender({ value: 'abc' });
    await act(() => {
      jest.advanceTimersByTime(200);
    });

    // Assert — 400 ms passed in total, but only 200 ms since the last change
    expect(result.current).toBe('a');
  });
});
