/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Reactotron is a development tool: it is never loaded in production builds.
if (__DEV__) {
  require('./src/vendors/reactotron');
  require('./src/vendors/dev-error-simulator/menu').registerErrorSimulationMenu();
}

AppRegistry.registerComponent(appName, () => App);
