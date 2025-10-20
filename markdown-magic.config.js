const fs = require('fs').promises;
const path = require('path');

module.exports = {
  transforms: {
    BADGES: require('markdown-magic-transform-badges'),
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
      const cwd = process.cwd();
      const pkgPath = path.join(cwd, 'package.json');
      let pkg;
      try {
        pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
      } catch (e) {
        return `<!-- ${transformName}: could not read package.json -->`;
      }

      const deps = Object.assign(
        {},
        pkg.dependencies || {},
        includeDev ? pkg.devDependencies || {} : {},
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
    }
  }
};
