require('dotenv-defaults/config');

const fs = require('fs');
const path = require('path');
const { ProvidePlugin } = require('webpack');

const DEPLOY_TO = `/www/res/sites/news-projects/<name>/<id>`;
const PUBLIC_PATH = path.join(__dirname, 'public');
const REDIRECT_DIR = `.redirect`;
const REDIRECT_PATH = path.join(__dirname, REDIRECT_DIR);
const TEMPLATE_FILENAME = 'index.html';

const includedDependencies = [/carbon-/];
const getLoaderDefinition = (config, testSourceMatch, loaderMatch) =>
  config.module.rules
    .find(({ test }) => test.source.indexOf(testSourceMatch) > -1)
    .use.find(({ loader }) => loader.indexOf(loaderMatch || testSourceMatch) > -1);

module.exports = {
  type: 'svelte',
  build: {
    extractCSS: true,
    includedDependencies
  },
  deploy: [
    {
      to: DEPLOY_TO
    },
    config => {
      const [, nonReleaseIdVariant] = config.id.match(/(?!\-)([a-z\-]+)/) || []; // e.g. master, pre, alpha, beta
      const redirectId = `latest${nonReleaseIdVariant ? `-${nonReleaseIdVariant}` : ''}`;
      const relativeAssetURL = `../${config.id}/`;
      const publicIndexHTML = fs.readFileSync(path.join(PUBLIC_PATH, 'index.html'), { encoding: 'utf8' });
      const redirectIndexHTML = publicIndexHTML
        .replace(/(\<\/title)/, ` v${config.id}$1`)
        .replace(/(index\.)/g, `${relativeAssetURL}$1`);

      if (!fs.existsSync(REDIRECT_PATH)) {
        fs.mkdirSync(REDIRECT_PATH);
      }

      fs.writeFileSync(path.join(REDIRECT_PATH, 'index.html'), redirectIndexHTML);

      return {
        ...config,
        from: REDIRECT_DIR,
        to: DEPLOY_TO.replace('<id>', redirectId)
      };
    }
  ],
  webpack: config => {
    // De-dupe svelte
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      svelte: path.resolve('node_modules', 'svelte')
    };

    // Polyfill some node.js APIs via module resolution fallbacks
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      assert: require.resolve('assert/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      timers: require.resolve('timers-browserify'),
      util: require.resolve('util/')
    };

    // Polyfill some node.js APIs via ProvidePlugin
    config.plugins.push(
      new ProvidePlugin({
        Buffer: [require.resolve('buffer/'), 'Buffer'],
        console: require.resolve('console-browserify'),
        process: require.resolve('process/browser')
      })
    );

    // Disable dart-sass warnings
    getLoaderDefinition(config, 'scss', 'sass').options = { sassOptions: { quietDeps: true } };

    // Disable svelte warnings when compiling dependencies
    getLoaderDefinition(config, 'svelte').options.onwarn = (warning, handler) => {
      for (const pattern of includedDependencies) {
        if (pattern.test(warning.filename)) {
          return;
        }
      }

      handler(warning);
    };

    return config;
  }
};
