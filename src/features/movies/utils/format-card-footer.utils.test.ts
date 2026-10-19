import { formatCardFooter } from './format-card-footer.utils';

describe('Util: formatCardFooter', () => {
  test('should join the year and genre names with a bullet and slashes', () => {
    // Act
    const result = formatCardFooter(2023, ['Acción', 'Aventura']);

    // Assert
    expect(result).toBe('2023 • Acción / Aventura');
  });

  test('should show a dash when the year is null', () => {
    // Act
    const result = formatCardFooter(null, ['Acción']);

    // Assert
    expect(result).toBe('– • Acción');
  });

  test('should omit the bullet and names when there are no genres', () => {
    // Act
    const result = formatCardFooter(2023, []);

    // Assert
    expect(result).toBe('2023');
  });
});
