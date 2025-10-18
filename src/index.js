const { Command } = require("commander");
const { cosmiconfigSync } = require("cosmiconfig");
const path = require("path");
const fs = require("fs");
const pkg = require("../package.json");
const loadConfig = require("./config");

const program = new Command();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)
  .option("-v, --verbose", "Enable verbose output")
  .option("--debug", "Enable debug mode")
  .option("--quiet", "Suppress output")
  .option("-c, --config <fileOrJson>", "Path to config file or JSON string");

// Configure help sorting and visibility
program.configureHelp({
  sortSubcommands: true,
  sortOptions: true,
  showGlobalOptions: true,
});

// Load CLI options early so config resolution can use them
// Use minimist for robust lightweight parsing of global flags without
// invoking commander full-parse early (which would consume subcommand help).
const minimist = require('minimist');
// Load cascaded config (Jest-style precedence handled inside loadConfig)
const explorer = cosmiconfigSync(pkg.name);
const minimistOpts = minimist(process.argv.slice(2), {
  boolean: ['verbose', 'debug', 'quiet'],
  alias: { v: 'verbose', c: 'config' },
  string: ['config'],
  default: {},
});
const cliOptions = {
  verbose: Boolean(minimistOpts.verbose),
  debug: Boolean(minimistOpts.debug),
  quiet: Boolean(minimistOpts.quiet),
  config: minimistOpts.config,
};
const cascadedConfig = loadConfig(explorer, cliOptions);

// If desired, merge globals into config here once
const mergedConfig = {
  ...cascadedConfig,
  globals: {
    verbose: Boolean(cliOptions.verbose),
    debug: Boolean(cliOptions.debug),
    quiet: Boolean(cliOptions.quiet),
  },
};

// Dynamically load commands (each command registers itself with program)
const commandsDir = path.join(__dirname, "commands");
if (fs.existsSync(commandsDir)) {
  fs.readdirSync(commandsDir).forEach((cmdFolder) => {
    const cmdPath = path.join(commandsDir, cmdFolder);
    if (fs.statSync(cmdPath).isDirectory()) {
      const cmdModule = require(path.join(cmdPath, "index.js"));
      cmdModule(program, mergedConfig);
    }
  });
}

// Re-parse argv now that commands are registered
program.parse(process.argv);

// If no command or option (only node and script), show help
// This handles cases where user runs: `my-cli` with no args
const userArgs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const hasNonFlagArgs = userArgs.length > 0;
const hasFlagOnly = process.argv.slice(2).some((a) => a.startsWith("-"));

// If no non-flag args and no flags (i.e., completely empty invocation), show help
if (!hasNonFlagArgs && !hasFlagOnly) {
  program.outputHelp();
  process.exit(0);
}

// If the user passed only global flags like --help, commander already handled them above.
// Normal command execution proceeds after this point.
module.exports = program;