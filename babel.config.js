module.exports = (api) => {
  const isProduction = api.env('production');

  return {
    plugins: [
      // Zod 4 ships `export * as ns from` in node_modules, which the React Native
      // Babel preset does not transform; this plugin must run before the others.
      '@babel/plugin-transform-export-namespace-from',
      [
        'module-resolver',
        {
          alias: {
            '@/src': './src',
          },
          root: ['.'],
        },
      ],
      isProduction && 'transform-remove-console',
      // react-native-worklets' plugin (Reanimated 4) MUST be listed last.
      'react-native-worklets/plugin',
    ].filter(Boolean),
    presets: ['module:@react-native/babel-preset'],
  };
};
