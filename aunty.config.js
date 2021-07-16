const fs = require('fs');
const path = require('path');

const DEPLOY_TO = `/www/res/sites/news-projects/<name>/<id>`;
const PUBLIC_PATH = path.join(__dirname, 'public');
const REDIRECT_DIR = `.redirect`;
const REDIRECT_PATH = path.join(__dirname, REDIRECT_DIR);
const TEMPLATE_FILENAME = 'index.html';

module.exports = {
  type: 'svelte',
  build: {
    extractCSS: true,
    includedDependencies: [/carbon-/]
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
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      svelte: path.resolve('node_modules', 'svelte')
    };

    return config;
  }
};
