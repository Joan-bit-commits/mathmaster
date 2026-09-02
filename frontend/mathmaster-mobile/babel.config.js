module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // nativewind/babel wraps its plugins in a preset-style object; inline the
      // two real plugins it would apply (css-interop imports + JSX runtime).
      [require.resolve('react-native-css-interop/dist/babel-plugin'), {}],
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic', importSource: 'react-native-css-interop' }],
      // Reanimated 3.x classic plugin (must be LAST). Reanimated 4 requires
      // react-native-worklets, which Expo Go does not ship — so we pin 3.x.
      'react-native-reanimated/plugin',
    ],
  };
};