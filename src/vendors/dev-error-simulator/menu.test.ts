import { DevSettings } from 'react-native';
import { getErrorSimulationMode, setErrorSimulationMode } from './simulator';
import { registerErrorSimulationMenu } from './menu';

describe('Dev tool: registerErrorSimulationMenu', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    setErrorSimulationMode('off');
  });

  test('should register one development menu item per simulation mode', () => {
    // Arrange
    const addMenuItem = jest.spyOn(DevSettings, 'addMenuItem').mockImplementation(() => undefined);

    // Act
    registerErrorSimulationMenu();

    // Assert
    expect(addMenuItem).toHaveBeenCalledTimes(5);
    expect(addMenuItem).toHaveBeenCalledWith('Simular: sin conexión', expect.any(Function));
  });

  test('should switch the simulation mode when its menu item is selected', () => {
    // Arrange
    const addMenuItem = jest.spyOn(DevSettings, 'addMenuItem').mockImplementation(() => undefined);
    registerErrorSimulationMenu();
    const serverItem = addMenuItem.mock.calls.find(([title]) => title === 'Simular: servidor 500');
    const handler = serverItem?.[1] as () => void;

    // Act
    handler();

    // Assert
    expect(getErrorSimulationMode()).toBe('server');
  });
});
