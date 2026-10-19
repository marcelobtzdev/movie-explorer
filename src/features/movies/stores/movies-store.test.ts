import { useMoviesStore } from './movies-store';

describe('Store: useMoviesStore', () => {
  afterEach(() => {
    useMoviesStore.getState().clearSearchTerm();
  });

  test('should start with an empty search term', () => {
    // Assert
    expect(useMoviesStore.getState().searchTerm).toBe('');
  });

  test('should store the committed search term', () => {
    // Act
    useMoviesStore.getState().setSearchTerm('fight club');

    // Assert
    expect(useMoviesStore.getState().searchTerm).toBe('fight club');
  });

  test('should empty the search term when cleared', () => {
    // Arrange
    useMoviesStore.getState().setSearchTerm('dune');

    // Act
    useMoviesStore.getState().clearSearchTerm();

    // Assert
    expect(useMoviesStore.getState().searchTerm).toBe('');
  });
});
