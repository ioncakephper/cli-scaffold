const fs = require('fs').promises;
const path = require('path');

function parseRepo(repo) {
  if (!repo) return null;
  if (typeof repo === 'object' && repo.url) repo = repo.url;
  if (typeof repo !== 'string') return null;

  // strip git+ prefix and .git suffix
  repo = repo.replace(/^git\+/, '').replace(/\.git$/, '');

  const m = repo.match(/github\.com[:\/](.+?)\/?$/i);
  if (!m) return null;
  return m[1]; // owner/repo
}

module.exports = {
  transforms: {
    ACKNOWLEDGMENTS: async ({ transform, options = {}, settings = {} }) => {
      // Default options
      const defaultOptions = {
        evaluateUsed: false, // when true, scan repo files and include only used packages
        includeDev: true, // whether to include devDependencies (can be overridden)
        highlightImportant: false, // boolean: if true, mark important packages automatically (heuristic)
      };

      // Extract transform-specific defaults from settings.transformDefaults[transform]
      const transformName = transform;
      const transformDefaults =
        (settings &&
          settings.transformDefaults &&
          settings.transformDefaults[transformName]) ||
        {};

      // Compute final options: merge defaultOptions <- transformDefaults <- options
      const finalOptions = Object.assign(
        {},
        defaultOptions,
        transformDefaults,
        options,
      );

      const evaluateUsed = finalOptions.evaluateUsed === true;
      const includeDev = finalOptions.includeDev !== false; // default true
      const highlightImportant = finalOptions.highlightImportant === true;

      // read repo package.json
      let repoPkg;
      const cwd = process.cwd();
      const pkgPath = path.join(cwd, 'package.json');
      if (!require('fs').existsSync(pkgPath))
        return `<!-- ${transformName}: could not read package.json -->`;
      const pkg = require(pkgPath);
      repoPkg = pkg;

      const deps = Object.assign(
        {},
        repoPkg.dependencies || {},
        includeDev ? repoPkg.devDependencies || {} : {},
      );

      let names = Object.keys(deps).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
      );
      if (names.length === 0) return '';

      // If evaluateUsed is true, scan repository files for usage
      const isUsed = {};
      if (evaluateUsed) {
        const walk = async (dir) => {
          const res = [];
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const ent of entries) {
            if (
              ent.name === 'node_modules' ||
              ent.name === '.git' ||
              ent.name === 'dist' ||
              ent.name === 'build'
            )
              continue;
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
              res.push(...(await walk(full)));
            } else if (ent.isFile()) {
              if (/\.(js|cjs|mjs|ts|tsx|jsx|json|md)$/.test(ent.name)) {
                res.push(full);
              }
            }
          }
          return res;
        };

        let files = [];
        try {
          files = await walk(cwd);
        } catch (_err) {
          files = [];
        }

        const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const pkgRegexes = {};
        for (const name of names) {
          const short = name.includes('/') ? name.split('/').pop() : name;
          const patterns = [
            new RegExp(`require\\(\\s*['"]${esc(name)}['"]\\s*\\)`, 'i'),
            new RegExp(`require\\(\\s*['"]${esc(short)}['"]\\s*\\)`, 'i'),
            new RegExp(`import[^;\\n]*from\\s+['"]${esc(name)}['"]`, 'i'),
            new RegExp(`import[^;\\n]*from\\s+['"]${esc(short)}['"]`, 'i'),
            new RegExp(`import\\s+['"]${esc(name)}['"]`, 'i'),
            new RegExp(`import\\s+['"]${esc(short)}['"]`, 'i'),
            new RegExp(`\\b${esc(short)}\\b`, 'i'),
          ];
          pkgRegexes[name] = patterns;
          isUsed[name] = false;
        }

        for (const f of files) {
          let content = '';
          try {
            const stat = await fs.stat(f);
            if (stat.size > 200 * 1024) continue;
            content = await fs.readFile(f, 'utf8');
          } catch (_err) {
            continue;
          }
          for (const name of names) {
            if (isUsed[name]) continue;
            const patterns = pkgRegexes[name];
            for (const re of patterns) {
              if (re.test(content)) {
                isUsed[name] = true;
                break;
              }
            }
          }
          if (names.every((n) => isUsed[n])) break;
        }

        names = names.filter((n) => isUsed[n]);
        if (names.length === 0)
          return '<!-- ACKNOWLEDGMENTS: no used packages detected -->';
      }

      // Heuristic: determine important packages if highlightImportant is true
      const importantSet = new Set();
      if (highlightImportant) {
        // mark top-level packages likely to be important: those used in source files (if evaluated) or common runtime deps
        // simple heuristic: prefer non-dev, non-scoped, and short names; also include popular tools by name
        const heuristics = [
          'express',
          'react',
          'webpack',
          'rollup',
          'vite',
          'babel',
          'typescript',
          'eslint',
          'mocha',
          'jest',
        ];
        for (const name of names) {
          if (heuristics.includes(name)) importantSet.add(name.toLowerCase());
        }
      }

      // For each dependency try to read its package.json from node_modules to get description
      const items = await Promise.all(
        names.map(async (name) => {
          const pkgPath = path.join(
            cwd,
            'node_modules',
            ...name.split('/'),
            'package.json',
          );
          let desc = '';
          try {
            const raw = await fs.readFile(pkgPath, 'utf8');
            const pkg = JSON.parse(raw);
            desc = (pkg.description || '').trim();
          } catch (_err) {
            desc = '';
          }

          const safeDesc = desc || 'No description available';
          const url =
            'https://www.npmjs.com/package/' + encodeURIComponent(name);

          const shouldHighlight = importantSet.has(name.toLowerCase());
          if (shouldHighlight) {
            return `- 🌟 **[${name}](${url})** — **${safeDesc}**`;
          } else {
            return `- [${name}](${url}) — ${safeDesc}`;
          }
        }),
      );

      return items.join('\n');
    },
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
     * - actions: GitHub Actions workflow status (uses `ciWorkflow` and `ciBranch` options or package.json fields, defaults to `ci.yml` and `main`)
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
     * - ciWorkflow: string (optional) — GitHub Actions workflow file name. Uses value from options or package.json, defaults to 'ci.yml'.
     * - ciBranch: string (optional) — GitHub Actions branch name. Uses value from options or package.json, defaults to 'main'.
     *
     * Example usage in README.md:
     * <!-- doc-gen BADGES style=for-the-badge collapse=true collapseLabel="More metrics" collapseVisible=4 ciWorkflow="build.yml" ciBranch="develop" -->
     *
     * Notes:
     * - Repository parsing supports both string and { url } forms in package.json
     *   (e.g. "git+https://github.com/owner/repo.git" or { "type": "git", "url": "..." }).
     * - The `actions` badge uses the workflow file and branch specified by the `ciWorkflow` and `ciBranch` options or package.json fields, falling back to `ci.yml` and `main` if not provided.
     */
    BADGES: ({ transform, options, settings = {} }) => {
      const defaultOptions = {
        style: null,
        ciWorkflow: 'ci.yml',
        ciBranch: 'main',
      };
      const globalOptions =
        (settings.transformDefaults && settings.transformDefaults[transform]) ||
        {};
      const opts = { ...defaultOptions, ...globalOptions, ...options };

      const style = opts.style
        ? `?style=${encodeURIComponent(opts.style)}`
        : '';
      // For URLs that already have a query param (eg ?branch=main) append with &
      const styleAmp = opts.style
        ? `&style=${encodeURIComponent(opts.style)}`
        : '';
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (!require('fs').existsSync(pkgPath)) return '';
      const pkg = require(pkgPath);

      const allBadges = [];
      const name = pkg.name;

      // helper to add named badges
      const pushBadge = (key, md) => allBadges.push({ key, md });

      if (name) {
        pushBadge(
          'npmVersion',
          `[![npm version](https://img.shields.io/npm/v/${encodeURIComponent(
            name,
          )}.svg${style})](https://www.npmjs.com/package/${encodeURIComponent(
            name,
          )})`,
        );
        pushBadge(
          'npmDownloads',
          `[![npm downloads](https://img.shields.io/npm/dw/${encodeURIComponent(
            name,
          )}.svg${style})](https://www.npmjs.com/package/${encodeURIComponent(
            name,
          )})`,
        );
      }

      if (pkg.version) {
        pushBadge(
          'version',
          `![version](https://img.shields.io/badge/version-${encodeURIComponent(
            pkg.version,
          )}-blue.svg${style})`,
        );
      }

      if (pkg.license) {
        pushBadge(
          'license',
          `![license](https://img.shields.io/badge/license-${encodeURIComponent(
            pkg.license,
          )}-blue.svg${style})`,
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
        const parts = ownerRepo.split('/');
        const owner = parts[0];
        const repoName = parts[1];
        const workflowFile = opts.ciWorkflow ?? pkg.ciWorkflow ?? 'ci.yml';
        const workflowBranch = opts.ciBranch ?? pkg.ciBranch ?? 'main';
        pushBadge(
          'actions',
          `[![actions status](https://img.shields.io/github/actions/workflow/status/${owner}/${repoName}/${workflowFile}?branch=${workflowBranch}${styleAmp})](https://github.com/${ownerRepo}/actions)`,
        );

        pushBadge(
          'codecov',
          `[![codecov](https://img.shields.io/codecov/c/github/${owner}/${repoName}?branch=${workflowBranch}${styleAmp})](https://codecov.io/gh/${ownerRepo})`,
        );

        pushBadge(
          'release',
          `[![release](https://img.shields.io/github/v/release/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/releases)`,
        );
        // Commit activity / maintained badge (yearly commits)
        pushBadge(
          'maintained',
          `[![maintained](https://img.shields.io/github/commit-activity/y/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/graphs/commit-activity)`,
        );
        pushBadge(
          'stars',
          `[![stars](https://img.shields.io/github/stars/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/stargazers)`,
        );
        pushBadge(
          'forks',
          `[![forks](https://img.shields.io/github/forks/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/network/members)`,
        );
        pushBadge(
          'watchers',
          `[![watchers](https://img.shields.io/github/watchers/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/watchers)`,
        );
        pushBadge(
          'lastCommit',
          `[![last commit](https://img.shields.io/github/last-commit/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/commits)`,
        );
        pushBadge(
          'contributors',
          `[![contributors](https://img.shields.io/github/contributors/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/graphs/contributors)`,
        );
        pushBadge(
          'issues',
          `[![issues](https://img.shields.io/github/issues/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/issues)`,
        );
        pushBadge(
          'pulls',
          `[![pull requests](https://img.shields.io/github/issues-pr/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/pulls)`,
        );
        pushBadge(
          'repoSize',
          `[![repo size](https://img.shields.io/github/repo-size/${owner}/${repoName}${style})](https://github.com/${ownerRepo})`,
        );
        pushBadge(
          'topLanguage',
          `[![top language](https://img.shields.io/github/languages/top/${owner}/${repoName}${style})](https://github.com/${ownerRepo})`,
        );
        pushBadge(
          'languages',
          `[![languages](https://img.shields.io/github/languages/count/${owner}/${repoName}${style})](https://github.com/${ownerRepo}/search?l=)`,
        );
      }

      // Collapse logic
      const collapse =
        opts.collapse === true || String(opts.collapse) === 'true';
      const collapseLabel = opts.collapseLabel || 'More badges';
      const collapseVisible = Number(opts.collapseVisible) || 3;

      const preferredOrder = ['npmVersion', 'actions', 'license', 'maintained'];
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
        return allBadges.map((b) => b.md).join(' ');
      }

      // Build collapsed output
      const visibleStr = visible.join(' ');
      const hiddenStr = hidden.join(' ');
      return (
        visibleStr +
        '\n\n<details>\n<summary>' +
        collapseLabel +
        '</summary>\n\n' +
        hiddenStr +
        '\n\n</details>'
      );
    },
  },
};
