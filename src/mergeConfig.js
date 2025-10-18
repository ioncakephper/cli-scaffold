module.exports = function mergeConfig(base, overrides) {
  return {
    ...base,
    ...overrides,
  };
};
