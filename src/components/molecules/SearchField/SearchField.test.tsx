import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { SearchField } from './SearchField';

const PROPS = {
  accessibilityLabel: 'Buscar películas',
  clearAccessibilityLabel: 'Borrar búsqueda',
  onChangeText: jest.fn(),
  onClear: jest.fn(),
  placeholder: 'Buscar películas',
};

describe('Component: SearchField', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should expose the input with its placeholder and accessible label', async () => {
    // Act
    await render(<SearchField {...PROPS} value="" />);

    // Assert
    expect(screen.getByLabelText('Buscar películas')).toBeTruthy();
    expect(screen.getByPlaceholderText('Buscar películas')).toBeTruthy();
  });

  test('should report typed text through onChangeText', async () => {
    // Arrange
    await render(<SearchField {...PROPS} value="" />);

    // Act
    await fireEvent.changeText(screen.getByLabelText('Buscar películas'), 'dune');

    // Assert
    expect(PROPS.onChangeText).toHaveBeenCalledWith('dune');
  });

  test('should hide the clear action while the field is empty', async () => {
    // Act
    await render(<SearchField {...PROPS} value="" />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Borrar búsqueda' })).toBeNull();
  });

  test('should show the clear action when the field has text and call onClear when pressed', async () => {
    // Arrange
    await render(<SearchField {...PROPS} value="dune" />);

    // Act
    await fireEvent.press(screen.getByRole('button', { name: 'Borrar búsqueda' }));

    // Assert
    expect(PROPS.onClear).toHaveBeenCalledTimes(1);
  });
});
