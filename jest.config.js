module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.mock.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/types.ts',
    '!src/**/constants.ts',
    '!src/**/strings.ts',
    '!src/constants/**',
    '!src/assets/**',
    '!src/vendors/**',
    '!src/utils/test-utils.tsx',
    '!src/**/*dto.ts',
    '!src/**/*dto.tsx',
  ],
  coverageProvider: 'v8',
  haste: {
    defaultPlatform: 'ios',
  },
  // Jest's own module resolution (unlike Metro's) does not prefer `.native.js`
  // over `.js` for third-party packages by default, so a package's web-only
  // implementation (e.g. @react-navigation/native's useDocumentTitle, which
  // touches the DOM `document` global) can be picked up instead of its native
  // no-op counterpart. Listing the native extensions first fixes this.
  moduleFileExtensions: ['native.js', 'native.jsx', 'native.ts', 'native.tsx', 'js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
  },
  preset: '@react-native/jest-preset',
  // Reanimated's resolver swaps its web-only internals in Jest (and delegates to
  // worklets' resolver), so its native initializers never run without a native module.
  resolver: 'react-native-reanimated/jest/resolver.js',
  setupFiles: ['./jest.setup.js'],
  // The default @react-native/jest-preset transformIgnorePatterns assumes a flat
  // node_modules layout; with pnpm's `.pnpm` nested store it fails to transform
  // react-native-ecosystem packages. See research.md §4 for the verified cause.
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|@shopify/flash-list|moti|react-native-reanimated|react-native-worklets|react-native-linear-gradient|react-native-config|react-native-screens|react-native-safe-area-context|@react-navigation)/)',
  ],
};
