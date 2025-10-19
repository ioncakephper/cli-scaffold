const spawnSync = require('cross-spawn').sync;
const path = require('path');

const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli.js');

test('--debug shows debug info and greeting', () => {
  const resDebug = spawnSync(
    process.execPath,
    [cliPath, '--debug', 'hello', 'Alice'],
    { encoding: 'utf8' },
  );
  const outDebug = (resDebug.stdout || '') + (resDebug.stderr || '');
  expect(outDebug).toMatch(/Debug info:/);
  expect(outDebug).toMatch(/Hello, (?:.* )?Alice!/);
});

test('--quiet suppresses greeting', () => {
  const resQuiet = spawnSync(
    process.execPath,
    [cliPath, '--quiet', 'hello', 'Bob'],
    { encoding: 'utf8' },
  );
  const outQuiet = (resQuiet.stdout || '') + (resQuiet.stderr || '');
  expect(outQuiet).not.toMatch(/Hello, Bob!/);
});
