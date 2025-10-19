const fs = require('fs');
const path = require('path');

function loadConfig(explorer, cliOptions = {}) {
  let config = {};

  // 1. Handle --config explicitly
  if (cliOptions.config) {
    const maybeJSON = cliOptions.config.trim();

    // If it looks like JSON, parse it
    if (maybeJSON.startsWith('{')) {
      try {
        config = JSON.parse(maybeJSON);
      } catch (_err) {
        console.error('Invalid JSON passed to --config');
        console.error(_err.message);

        process.exit(1);
      }
    } else {
      // Otherwise treat as a path relative to CWD
      const configPath = path.resolve(process.cwd(), maybeJSON);
      if (!fs.existsSync(configPath)) {
        console.error(`Config file not found: ${configPath}`);

        process.exit(1);
      }
      try {
        config = require(configPath);
      } catch (_err) {
        console.error(`Failed to load config file: ${configPath}`);

        console.error(_err.message);

        process.exit(1);
      }
    }
  } else {
    // 2. Cascade search via cosmiconfig
    const result = explorer.search(process.cwd());
    if (result && result.config) {
      config = result.config;
    } else {
      // 3. Fallback to default.config.js if present
      const defaultConfigPath = path.join(
        __dirname,
        '..',
        'config',
        'default.config.js',
      );
      if (fs.existsSync(defaultConfigPath)) {
        config = require(defaultConfigPath);
      } else {
        config = {};
      }
    }
  }

  // 4. Merge CLI options on top
  return {
    ...config,
    ...cliOptions,
  };
}

module.exports = loadConfig;
