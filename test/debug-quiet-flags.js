const { spawnSync } = require('child_process');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

// Run with --debug flag and a name to see debug output plus greeting
const resDebug = spawnSync(process.execPath, [cliPath, '--debug', 'hello', 'Alice'], { encoding: 'utf8' });
if (resDebug.error) {
  console.error('Failed to run CLI (debug):', resDebug.error);
  process.exit(2);
}
const outDebug = (resDebug.stdout || '') + (resDebug.stderr || '');
// Accept optional title like "Mr." from default config: "Hello, Mr. Alice!"
if (!/Hello, (?:.* )?Alice!/.test(outDebug)) {
  console.error('Debug flag test failed to include greeting. Output:\n', outDebug);
  process.exit(1);
}

// Run with --quiet should suppress greeting
const resQuiet = spawnSync(process.execPath, [cliPath, '--quiet', 'hello', 'Bob'], { encoding: 'utf8' });
if (resQuiet.error) {
  console.error('Failed to run CLI (quiet):', resQuiet.error);
  process.exit(2);
}
const outQuiet = (resQuiet.stdout || '') + (resQuiet.stderr || '');
if (/Hello, Bob!/.test(outQuiet)) {
  console.error('Quiet flag test failed; greeting should be suppressed. Output:\n', outQuiet);
  process.exit(1);
}

console.log('debug and quiet flags test passed');
process.exit(0);
