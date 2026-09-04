module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // nativewind/babel wraps its plugins in a preset-style object; inline the
      // two real plugins it would apply (css-interop imports + JSX runtime).
      [require.resolve('react-native-css-interop/dist/babel-plugin'), {}],
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic', importSource: 'react-native-css-interop' }],
      // Reanimated 4: worklets plugin (must be LAST).
      // Requires a development build — NOT Expo Go (worklets native module).
      'react-native-worklets/plugin',
    ],
  };
};
