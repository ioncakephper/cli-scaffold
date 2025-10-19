const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

// Create a temporary config file with known values
const tmpConfigPath = path.join(__dirname, 'tmp.config.js');
fs.writeFileSync(
  tmpConfigPath,
  'module.exports = { hello: { name: "ConfigName", title: "Dr." } };',
);

const result = spawnSync(process.execPath, [cliPath, 'ConfigName'], {
  encoding: 'utf8',
});
if (result.error) {
  console.error('Failed to run CLI:', result.error);
  fs.unlinkSync(tmpConfigPath);
  process.exit(2);
}

// Run with explicit --config path
const resultWithConfig = spawnSync(
  process.execPath,
  [cliPath, '--config', tmpConfigPath, 'hello'],
  { encoding: 'utf8' },
);

const out = (resultWithConfig.stdout || '') + (resultWithConfig.stderr || '');

fs.unlinkSync(tmpConfigPath);

if (!/Hello, Dr. ConfigName!/.test(out)) {
  console.error('Config flag test failed. Output:\n', out);
  process.exit(1);
}

console.log('config flag test passed');
process.exit(0);
