const { spawnSync } = require('child_process');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');
const result = spawnSync(process.execPath, [cliPath, 'help', 'hello'], {
  encoding: 'utf8',
});

if (result.error) {
  console.error('Failed to run CLI:', result.error);
  process.exit(2);
}

const out = result.stdout + result.stderr;

if (!/Say hello to someone/.test(out)) {
  console.error(
    'Help output did not contain expected description. Output:\n',
    out,
  );
  process.exit(1);
}

console.log('help hello output looks correct');
process.exit(0);
