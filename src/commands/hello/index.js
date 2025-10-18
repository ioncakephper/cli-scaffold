const action = require("./action");
const resolveValue = require("../../resolveValue");

module.exports = (program, config) => {
  program
    .command("hello [name]")
    .description("Say hello to someone")
    .option("-t, --title <title>", "Add a title before the name")
    .action((name, cmdOptions) => {
      // Resolve argument first
      const resolvedName = resolveValue(name, config.hello?.name, "world");

      // Resolve option by name
      const resolvedTitle = resolveValue(
        cmdOptions.title,
        config.hello?.title,
        ""
      );

      // Merge globals and resolved options
      const options = {
        ...config.globals,
        title: resolvedTitle,
      };

      // Pass resolved argument and merged options to action
      action({ name: resolvedName, options });
    });
};
