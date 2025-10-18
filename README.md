# cli-scaffold

Small CLI scaffold used for examples and tests.

<!-- doc-gen BADGES style=for-the-badge -->
[![npm version](https://img.shields.io/npm/v/cli-scaffold.svg?style=for-the-badge)](https://www.npmjs.com/package/cli-scaffold) [![npm downloads](https://img.shields.io/npm/dw/cli-scaffold.svg?style=for-the-badge)](https://www.npmjs.com/package/cli-scaffold) ![version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge) ![license](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)
<!-- end-doc-gen -->

## Table of Contents

<!-- doc-gen TOC -->
- [Running locally](#running-locally)
- [Running tests (Jest)](#running-tests-jest)
- [CI (GitHub Actions)](#ci-github-actions)
  - [Optional Codecov upload](#optional-codecov-upload)
- [How to open a PR with these changes](#how-to-open-a-pr-with-these-changes)
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
    ├── LICENSE
    ├── markdown-magic.config.js
    ├── package-lock.json
    ├── package.json
    └── README.md
```
<!-- end-doc-gen -->
