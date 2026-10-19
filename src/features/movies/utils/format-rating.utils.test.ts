import { formatRating } from './format-rating.utils';

describe('Util: formatRating', () => {
  test('should format a numeric rating to exactly one decimal', () => {
    // Act
    const result = formatRating(7.8);

    // Assert
    expect(result).toBe('7.8');
  });

  test('should round to one decimal when the source has more precision', () => {
    // Act
    const result = formatRating(6.456);

    // Assert
    expect(result).toBe('6.5');
  });

  test('should format null as a dash', () => {
    // Act
    const result = formatRating(null);

    // Assert
    expect(result).toBe('–');
  });
});
