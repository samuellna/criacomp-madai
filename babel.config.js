module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // ou 'module:metro-react-native-babel-preset' se não for expo
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          safe: false,
          allowUndefined: false,
        },
      ],
    ],
  };
};
