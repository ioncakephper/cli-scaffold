const fs = require("fs");
const path = require("path");

function parseRepo(repo) {
  if (!repo) return null;
  if (typeof repo === "object" && repo.url) repo = repo.url;
  if (typeof repo !== "string") return null;

  // strip git+ prefix and .git suffix
  repo = repo.replace(/^git\+/, "").replace(/\.git$/, "");

  const m = repo.match(/github\.com[:\/](.+?)\/?$/i);
  if (!m) return null;
  return m[1]; // owner/repo
}

module.exports = {
  transforms: {
    // BADGES transform supports an option: { style: 'flat'|'flat-square'|'for-the-badge'|'plastic'|... }
    // Default: no style parameter (keeps existing appearance)
    BADGES: ({ transform, options, settings = {} }) => {
      const defaultOptions = {
        style: null,
      };
      const globalOptions =
        (settings.transformDefaults && settings.transformDefaults[transform]) ||
        {};
      const opts = { ...defaultOptions, ...globalOptions, ...options };

      const style = opts.style
        ? `?style=${encodeURIComponent(opts.style)}`
        : "";
      const pkgPath = path.join(process.cwd(), "package.json");
      if (!fs.existsSync(pkgPath)) return "";
      const pkg = require(pkgPath);

      const badges = [];
      const name = pkg.name;

      if (name) {
        // npm version and downloads
        badges.push(
          `[![npm version](https://img.shields.io/npm/v/${encodeURIComponent(
            name
          )}.svg${style})](https://www.npmjs.com/package/${encodeURIComponent(
            name
          )})`
        );
        badges.push(
          `[![npm downloads](https://img.shields.io/npm/dw/${encodeURIComponent(
            name
          )}.svg${style})](https://www.npmjs.com/package/${encodeURIComponent(
            name
          )})`
        );
      }

      if (pkg.version) {
        badges.push(
          `![version](https://img.shields.io/badge/version-${encodeURIComponent(
            pkg.version
          )}-blue.svg${style})`
        );
      }

      if (pkg.license) {
        badges.push(
          `![license](https://img.shields.io/badge/license-${encodeURIComponent(
            pkg.license
          )}-blue.svg${style})`
        );
      }

      const ownerRepo = parseRepo(pkg.repository);
      if (ownerRepo) {
        // GitHub Actions badge (workflow named ci.yml)
        // Actions badges aren't from shields.io so style param is not applied
        badges.push(
          `[![actions status](https://github.com/${ownerRepo}/actions/workflows/ci.yml/badge.svg)](https://github.com/${ownerRepo}/actions)`
        );

        // Codecov badge for main branch
        badges.push(
          `[![codecov](https://codecov.io/gh/${ownerRepo}/branch/main/graph/badge.svg)](https://codecov.io/gh/${ownerRepo})`
        );
      }

      // Join badges with a space so they render inline
      return badges.join(" ");
    },
  },
};
