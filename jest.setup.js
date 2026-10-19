process.env.TZ = 'UTC';

require('react-native-reanimated').setUpTests();
require('@shopify/flash-list/jestSetup');

jest.mock('react-native-config', () => ({
  TMDB_ACCESS_TOKEN: 'test-token',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
}));

jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock'));
