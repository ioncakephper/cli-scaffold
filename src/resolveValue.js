/**
 * Resolve a value with clear precedence:
 * 1. CLI-provided value
 * 2. Config value
 * 3. Hardcoded fallback
 */
function resolveValue(cliValue, configValue, fallback) {
  if (cliValue !== undefined && cliValue !== null) return cliValue;
  if (configValue !== undefined && configValue !== null) return configValue;
  return fallback;
}

module.exports = resolveValue;
