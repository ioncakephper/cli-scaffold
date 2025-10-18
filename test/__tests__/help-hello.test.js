const spawnSync = require('cross-spawn').sync;
const path = require('path');

test('help hello shows description and options', () => {
  const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli.js');
  const result = spawnSync(process.execPath, [cliPath, 'help', 'hello'], { encoding: 'utf8' });
  // cross-spawn returns an object with stdout/stderr and status; errors throw
  const out = (result.stdout || '') + (result.stderr || '');
  expect(out).toMatch(/Say hello to someone/);
  expect(out).toMatch(/-t, --title <title>/);
});
