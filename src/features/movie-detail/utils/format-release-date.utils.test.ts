import { formatReleaseDate } from './format-release-date.utils';

describe('Util: formatReleaseDate', () => {
  test('should format an ISO date in Spanish long form', () => {
    // Act / Assert
    expect(formatReleaseDate('2024-03-01')).toBe('1 de marzo de 2024');
    expect(formatReleaseDate('1999-10-15')).toBe('15 de octubre de 1999');
  });

  test('should return null for a missing date', () => {
    // Act / Assert
    expect(formatReleaseDate(null)).toBeNull();
    expect(formatReleaseDate('')).toBeNull();
  });

  test('should return null for an invalid date', () => {
    // Act / Assert
    expect(formatReleaseDate('2024-13-01')).toBeNull();
    expect(formatReleaseDate('marzo 2024')).toBeNull();
  });
});
