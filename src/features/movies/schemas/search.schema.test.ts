import { SearchSchema } from './search.schema';

describe('Schema: SearchSchema', () => {
  test('should trim surrounding whitespace from the query', () => {
    // Act
    const result = SearchSchema.parse({ query: '  dune  ' });

    // Assert
    expect(result.query).toBe('dune');
  });

  test('should accept an empty or whitespace-only query', () => {
    // Assert
    expect(SearchSchema.parse({ query: '' }).query).toBe('');
    expect(SearchSchema.parse({ query: '   ' }).query).toBe('');
  });

  test('should accept a query of exactly 100 characters', () => {
    // Arrange
    const query = 'a'.repeat(100);

    // Assert
    expect(SearchSchema.safeParse({ query }).success).toBe(true);
  });

  test('should reject a query longer than 100 characters', () => {
    // Arrange
    const query = 'a'.repeat(101);

    // Assert
    expect(SearchSchema.safeParse({ query }).success).toBe(false);
  });
});
