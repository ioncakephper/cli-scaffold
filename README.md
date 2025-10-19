# cli-scaffold

Small CLI scaffold used for examples and tests.

<!-- doc-gen BADGES style=for-the-badge collapse=true collapseLabel="More badges" collapseVisible=4 -->

[![npm version](https://img.shields.io/npm/v/cli-scaffold.svg?style=for-the-badge)](https://www.npmjs.com/package/cli-scaffold) [![actions status](https://img.shields.io/github/actions/workflow/status/ioncakephper/cli-scaffold/ci.yml?branch=main&style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/actions) ![license](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge) [![maintained](https://img.shields.io/github/commit-activity/y/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/graphs/commit-activity)

<details>
<summary>More badges</summary>

[![npm downloads](https://img.shields.io/npm/dw/cli-scaffold.svg?style=for-the-badge)](https://www.npmjs.com/package/cli-scaffold) ![version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge) [![codecov](https://img.shields.io/codecov/c/github/ioncakephper/cli-scaffold?branch=main&style=for-the-badge)](https://codecov.io/gh/ioncakephper/cli-scaffold) [![release](https://img.shields.io/github/v/release/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/releases) [![stars](https://img.shields.io/github/stars/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/stargazers) [![forks](https://img.shields.io/github/forks/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/network/members) [![watchers](https://img.shields.io/github/watchers/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/watchers) [![last commit](https://img.shields.io/github/last-commit/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/commits) [![contributors](https://img.shields.io/github/contributors/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/graphs/contributors) [![issues](https://img.shields.io/github/issues/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/issues) [![pull requests](https://img.shields.io/github/issues-pr/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/pulls) [![repo size](https://img.shields.io/github/repo-size/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold) [![top language](https://img.shields.io/github/languages/top/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold) [![languages](https://img.shields.io/github/languages/count/ioncakephper/cli-scaffold?style=for-the-badge)](https://github.com/ioncakephper/cli-scaffold/search?l=)

</details>
<!-- end-doc-gen -->

## Table of Contents

<!-- doc-gen TOC -->

- [Running locally](#running-locally)
- [Running tests (Jest)](#running-tests-jest)
- [CI (GitHub Actions)](#ci-github-actions)
  - [Optional Codecov upload](#optional-codecov-upload)
- [How to open a PR with these changes](#how-to-open-a-pr-with-these-changes)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Project Structure](#project-structure)
<!-- end-doc-gen -->

## Running locally

Install dependencies:

```cmd
npm install
```

Run the CLI:

```cmd
node ./bin/cli.js hello
node ./bin/cli.js help hello
```

## Running tests (Jest)

Run the test suite:

```cmd
npm test
```

Run tests with coverage:

```cmd
npm test -- --coverage
```

## CI (GitHub Actions)

A workflow is provided at `.github/workflows/ci.yml`. It runs the Jest suite across Linux, Windows, and macOS for Node.js 18 and 20 and uploads coverage artifacts for each matrix job.

### Optional Codecov upload

The workflow uploads coverage to Codecov for public repositories by default. To enable uploads for private repos, add a `CODECOV_TOKEN` repository secret and the workflow will use it.

## How to open a PR with these changes

I cannot open a remote PR from this environment. To create a PR locally:

1. Create a new branch:

```cmd
git checkout -b feature/ci-readme
```

1. Commit the changes:

```cmd
git add .
git commit -m "Add CI workflow, tests, and README"
```

1. Push and open a PR on GitHub:

```cmd
git push -u origin feature/ci-readme
```

Then open a PR from the branch in the repository UI.

If you want, I can prepare a patch or branch here for you to push.

## Contributing

See `CONTRIBUTING.md` for details on how to raise issues, propose changes, and submit pull requests. In short:

- Open issues for bugs or feature requests with clear reproduction steps.
- For code contributions, fork the repo, create a branch, add tests, and open a PR against `main`.

## License

This project is licensed under the terms of the MIT License. See the `LICENSE` file for details.

## Acknowledgments

Thanks to the following projects and tools used in this repository:

- commander — command-line framework used for building the CLI
- cosmiconfig — configuration file loading and cascading
- minimist — lightweight argument parsing (used for early global flag parsing)
- jest — test runner
- markdown-magic — docs automation for README generation
- cross-spawn — cross-platform process spawning for tests

## Project Structure

<!-- doc-gen fileTree -->

```
└── cli-scaffold/
    ├── bin/
    │   └── cli.js
    ├── config/
    │   └── default.config.js
    ├── coverage/
    │   ├── lcov-report/
    │   │   ├── base.css
    │   │   ├── block-navigation.js
    │   │   ├── favicon.png
    │   │   ├── index.html
    │   │   ├── prettify.css
    │   │   ├── prettify.js
    │   │   ├── sort-arrow-sprite.png
    │   │   └── sorter.js
    │   ├── clover.xml
    │   ├── coverage-final.json
    │   └── lcov.info
    ├── src/
    │   ├── commands/
    │   │   └── hello/
    │   │       ...
    │   ├── config.js
    │   ├── index.js
    │   ├── mergeConfig.js
    │   └── resolveValue.js
    ├── test/
    │   ├── __tests__/
    │   │   ├── cascading-config.test.js
    │   │   ├── config-flag.test.js
    │   │   ├── debug-quiet-flags.test.js
    │   │   └── help-hello.test.js
    │   ├── config-flag.js
    │   ├── debug-quiet-flags.js
    │   └── help-hello.js
    ├── .prettierrc.json
    ├── CHANGELOG.md
    ├── CONTRIBUTING.md
    ├── eslint.config.mjs
    ├── LICENSE
    ├── markdown-magic.config.js
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── RULES_OF_CONDUCT.md
```

<!-- end-doc-gen -->
