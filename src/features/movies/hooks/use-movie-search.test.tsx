import { act, renderHook } from '@/src/utils/test-utils';
import { useMoviesStore } from '../stores/movies-store';
import { useMovieSearch } from './use-movie-search';

describe('Hook: useMovieSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useMoviesStore.getState().setSearchTerm('stale term');
  });

  afterEach(() => {
    jest.useRealTimers();
    useMoviesStore.getState().clearSearchTerm();
  });

  test('should reset the committed term to empty on mount', async () => {
    // Act
    await renderHook(() => useMovieSearch());

    // Assert
    expect(useMoviesStore.getState().searchTerm).toBe('');
  });

  test('should expose the form control and a clear action', async () => {
    // Act
    const { result } = await renderHook(() => useMovieSearch());

    // Assert
    expect(result.current.control).toBeDefined();
    expect(typeof result.current.clear).toBe('function');
  });

  test('clear should empty the committed term immediately, without waiting for the debounce', async () => {
    // Arrange
    const { result } = await renderHook(() => useMovieSearch());
    useMoviesStore.getState().setSearchTerm('dune');

    // Act
    await act(() => {
      result.current.clear();
    });

    // Assert
    expect(useMoviesStore.getState().searchTerm).toBe('');
  });
});
