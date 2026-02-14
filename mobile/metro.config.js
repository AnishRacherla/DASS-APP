const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force axios to use browser build instead of Node build
  if (moduleName === 'axios') {
    return {
      filePath: require.resolve('axios/dist/browser/axios.cjs'),
      type: 'sourceFile',
    };
  }
  
  // Default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
