const spawnSync = require('cross-spawn').sync;
const path = require('path');
const fs = require('fs');

test('--config <file> loads config and affects hello output', () => {
  const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli.js');
  const tmpConfigPath = path.join(__dirname, '..', 'tmp.config.js');
  fs.writeFileSync(
    tmpConfigPath,
    'module.exports = { hello: { name: "ConfigName", title: "Dr." } };',
  );

  const resultWithConfig = spawnSync(
    process.execPath,
    [cliPath, '--config', tmpConfigPath, 'hello'],
    { encoding: 'utf8' },
  );
  const out = (resultWithConfig.stdout || '') + (resultWithConfig.stderr || '');
  try {
    expect(out).toMatch(/Hello, Dr. ConfigName!/);
  } finally {
    // ensure cleanup
    if (fs.existsSync(tmpConfigPath)) fs.unlinkSync(tmpConfigPath);
  }
});
