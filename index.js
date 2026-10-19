/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Reactotron is a development tool: it is never loaded in production builds.
if (__DEV__) {
  require('./src/vendors/reactotron');
}

AppRegistry.registerComponent(appName, () => App);
