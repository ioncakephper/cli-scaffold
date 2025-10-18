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
  /**
   * BADGES transform
   *
   * Generates a set of project badges based on `package.json` and the
   * repository specified in `package.json.repository`.
   *
   * Badges generated (when applicable):
   * - npmVersion: npm package version
   * - npmDownloads: npm downloads (weekly)
   * - version: package.json version (custom badge)
   * - license: package license
   * - actions: GitHub Actions workflow status (assumes `ci.yml`)
   * - codecov: codecov coverage badge (branch: main)
   * - release: latest GitHub release
   * - maintained: commit-activity (yearly)
   * - stars: GitHub stars
   * - forks: GitHub forks
   * - watchers: GitHub watchers
   * - lastCommit: last commit date
   * - contributors: contributors count
   * - issues: open issues
   * - pulls: open PRs
   * - repoSize: repository size
   * - topLanguage: top language in repo
   * - languages: count of languages
   *
   * Options (via doc-gen block or markdown-magic settings):
   * - style: shields.io style (e.g. 'flat', 'flat-square', 'for-the-badge')
   *   Applies to shields.io badges. Internally a `style` query is appended
   *   as `?style=...` or `&style=...` if the badge URL already contains query params.
   * - collapse: boolean (default false). If true, less-important badges are
   *   hidden inside a GitHub <details> block.
   * - collapseLabel: string (default 'More badges') — label used for the
   *   <summary> when collapsing.
   * - collapseVisible: number (default 3) — how many badges are shown
   *   before collapsing the rest.
   *
   * Example usage in README.md:
   * <!-- doc-gen BADGES style=for-the-badge collapse=true collapseLabel="More metrics" collapseVisible=4 -->
   *
   * Notes:
   * - Repository parsing supports both string and { url } forms in package.json
   *   (e.g. "git+https://github.com/owner/repo.git" or { "type": "git", "url": "..." }).
   * - `actions` badge assumes a workflow file named `ci.yml` on branch `main`.
   *   If your workflow or branch differs, consider adding configuration fields
   *   to package.json (e.g. `ciWorkflow`, `ciBranch`) and modifying the transform.
   */
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
      // For URLs that already have a query param (eg ?branch=main) append with &
      const styleAmp = opts.style ? `&style=${encodeURIComponent(opts.style)}` : "";
      const pkgPath = path.join(process.cwd(), "package.json");
      if (!fs.existsSync(pkgPath)) return "";
      const pkg = require(pkgPath);

      const allBadges = [];
      const name = pkg.name;

      // helper to add named badges
      const pushBadge = (key, md) => allBadges.push({ key, md });

      if (name) {
        pushBadge(
          "npmVersion",
          `[![npm version](https://img.shields.io/npm/v/${encodeURIComponent(
            name
          )}.svg${style})](https://www.npmjs.com/package/${encodeURIComponent(
            name
          )})`
        );
        pushBadge(
          "npmDownloads",
          `[![npm downloads](https://img.shields.io/npm/dw/${encodeURIComponent(
            name
          )}.svg${style})](https://www.npmjs.com/package/${encodeURIComponent(
            name
          )})`
        );
      }

      if (pkg.version) {
        pushBadge(
          "version",
          `![version](https://img.shields.io/badge/version-${encodeURIComponent(
            pkg.version
          )}-blue.svg${style})`
        );
      }

      if (pkg.license) {
        pushBadge(
          "license",
          `![license](https://img.shields.io/badge/license-${encodeURIComponent(
            pkg.license
          )}-blue.svg${style})`
        );
      }

      // Maintained badge based on commit activity (yearly activity)
      // Uses shields endpoint for commit-activity (y: yearly), which supports style
      // Example: https://img.shields.io/github/commit-activity/y/owner/repo?style=flat
      // We'll render as 'maintained' with value 'active' (visual indicator)
      // The actual numeric activity isn't available via this shield, but the badge indicates activity.
      // We'll add the badge unconditionally when repository is present.

      const ownerRepo = parseRepo(pkg.repository);
      if (ownerRepo) {
        const parts = ownerRepo.split("/");
        const owner = parts[0];
        const repoName = parts[1];

        // Get workflow file and branch from package.json or options, fallback to defaults
        const ciWorkflow = opts.ciWorkflow || pkg.ciWorkflow || "ci.yml";
        const ciBranch = opts.ciBranch || pkg.ciBranch || "main";

        pushBadge(
          "actions",
          `[![actions status](https://img.shields.io/github/actions/workflow/status/${owner}/${repoName}/${ciWorkflow}?branch=${ciBranch}${styleAmp})](https://github.com/${ownerRepo}/actions)`
        );

        pushBadge(
          "codecov",
          `[![codecov](https://img.shields.io/codecov/c/github/${owner}/${repoName}?branch=${ciBranch}${styleAmp})](https://codecov.io/gh/${ownerRepo})`
        );

        pushBadge(
          "release",
          `[![release](https://img.shields.io/github/v/release/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/releases)`
        );
        // Commit activity / maintained badge (yearly commits)
        pushBadge(
          "maintained",
          `[![maintained](https://img.shields.io/github/commit-activity/y/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/graphs/commit-activity)`
        );
        pushBadge(
          "stars",
          `[![stars](https://img.shields.io/github/stars/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/stargazers)`
        );
        pushBadge(
          "forks",
          `[![forks](https://img.shields.io/github/forks/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/network/members)`
        );
        pushBadge(
          "watchers",
          `[![watchers](https://img.shields.io/github/watchers/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/watchers)`
        );
        pushBadge(
          "lastCommit",
          `[![last commit](https://img.shields.io/github/last-commit/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/commits)`
        );
        pushBadge(
          "contributors",
          `[![contributors](https://img.shields.io/github/contributors/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/graphs/contributors)`
        );
        pushBadge(
          "issues",
          `[![issues](https://img.shields.io/github/issues/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/issues)`
        );
        pushBadge(
          "pulls",
          `[![pull requests](https://img.shields.io/github/issues-pr/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/pulls)`
        );
        pushBadge(
          "repoSize",
          `[![repo size](https://img.shields.io/github/repo-size/${owner}/${repoName}${style})](https://github.com/${ownerRepo})`
        );
        pushBadge(
          "topLanguage",
          `[![top language](https://img.shields.io/github/languages/top/${owner}/${repoName}${style})](https://github.com/${ownerRepo})`
        );
        pushBadge(
          "languages",
          `[![languages](https://img.shields.io/github/languages/count/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/search?l=)`
        );
      }

      // Collapse logic
      const collapse = opts.collapse === true || String(opts.collapse) === "true";
      const collapseLabel = opts.collapseLabel || "More badges";
      const collapseVisible = Number(opts.collapseVisible) || 3;

      const preferredOrder = ["npmVersion", "actions", "license", "maintained"];
      const visible = [];
      const hidden = [];

      // map for quick lookup
      const byKey = allBadges.reduce((map, b) => {
        map[b.key] = b.md;
        return map;
      }, {});

      // add preferred first
      for (const k of preferredOrder) {
        if (byKey[k]) {
          visible.push(byKey[k]);
          delete byKey[k];
        }
        if (visible.length >= collapseVisible) break;
      }

      // fill remaining visible up to collapseVisible
      if (visible.length < collapseVisible) {
        for (const b of allBadges) {
          if (visible.length >= collapseVisible) break;
          if (!byKey[b.key]) continue; // already added
          visible.push(b.md);
          delete byKey[b.key];
        }
      }

      // remaining go to hidden
      for (const k of Object.keys(byKey)) {
        hidden.push(byKey[k]);
      }

      // If collapse not requested or nothing hidden, return all inline
      if (!collapse || hidden.length === 0) {
        return allBadges.map((b) => b.md).join(" ");
      }

      // Build collapsed output
      const visibleStr = visible.join(" ");
      const hiddenStr = hidden.join(" ");
      return (
        visibleStr +
        "\n\n<details>\n<summary>" +
        collapseLabel +
        "</summary>\n\n" +
        hiddenStr +
        "\n\n</details>"
      );
    },
  },
};
