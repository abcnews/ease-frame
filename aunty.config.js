const path = require('path');

module.exports = {
  type: 'svelte',
  build: {
    includedDependencies: [/carbon-/]
  },
  webpack: config => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      svelte: path.resolve('node_modules', 'svelte')
    };

    return config;
  }
};
