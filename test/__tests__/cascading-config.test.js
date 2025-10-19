const spawnSync = require('cross-spawn').sync;
const path = require('path');
const fs = require('fs');

const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli.js');

test('uses default.config.js when no --config is provided', () => {
  const res = spawnSync(process.execPath, [cliPath, 'hello'], {
    encoding: 'utf8',
  });
  const out = (res.stdout || '') + (res.stderr || '');
  // default.config.js defines title: 'Mr.' and name: 'Ion'
  expect(out).toMatch(/Hello, Mr. Ion!/);
});

test('loads config when --config points to a file relative to CWD', () => {
  // create a config in the test dir with different values
  const tmpConfigName = 'relative.config.js';
  const tmpConfigPath = path.join(process.cwd(), 'test', tmpConfigName);
  fs.writeFileSync(
    tmpConfigPath,
    "module.exports = { hello: { name: 'RelName', title: 'Prof.' } };\n",
  );

  try {
    // pass relative path from CWD
    const res = spawnSync(
      process.execPath,
      [cliPath, '--config', path.join('test', tmpConfigName), 'hello'],
      { encoding: 'utf8' },
    );
    const out = (res.stdout || '') + (res.stderr || '');
    expect(out).toMatch(/Hello, Prof. RelName!/);
  } finally {
    if (fs.existsSync(tmpConfigPath)) fs.unlinkSync(tmpConfigPath);
  }
});
