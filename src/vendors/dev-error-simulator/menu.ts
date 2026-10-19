import { DevSettings } from 'react-native';
import { ERROR_SIMULATION_MODES, setErrorSimulationMode, type ErrorSimulationMode } from './simulator';

const MENU_LABELS: Record<ErrorSimulationMode, string> = {
  'fail-three': 'Simular: fallar 3 y recuperar',
  network: 'Simular: sin conexión',
  off: 'Simular: normal',
  server: 'Simular: servidor 500',
  unauthorized: 'Simular: 401',
};

// Adds one item per mode to the React Native development menu (Cmd+D / Cmd+M / shake).
export const registerErrorSimulationMenu = (): void => {
  for (const mode of ERROR_SIMULATION_MODES) {
    DevSettings.addMenuItem(MENU_LABELS[mode], () => setErrorSimulationMode(mode));
  }
};
