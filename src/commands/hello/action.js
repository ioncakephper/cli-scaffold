module.exports = ({ name, options }) => {
  if (options.debug) {
    console.log('Debug info:', { name, options });
  }

  if (!options.quiet) {
    console.log(`Hello, ${options.title} ${name}!`.trim());
  }
};
