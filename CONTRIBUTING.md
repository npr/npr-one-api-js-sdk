# Contributing

If you're interested in contributing to this project by submitting bug reports, helping to improve the documentation, or writing actual code, please read on.

##### Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Submitting Issues](#submitting-issues)
  - [Got a Question or Problem?](#got-a-question-or-problem)
  - [Found a Bug?](#found-a-bug)
  - [Want a Feature?](#want-a-feature)
- [Contributing to Development](#contributing-to-development)
  - [Technology Stack](#technology-stack)
  - [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Command-Line Tasks](#command-line-tasks)
  - [Coding Style](#coding-style)
  - [Unit Tests](#unit-tests)
    - [Running Tests](#running-tests)
  - [Generating Documentation](#generating-documentation)
  - [Committing Your Changes](#committing-your-changes)
  - [Publishing Releases](#publishing-releases)


## Code of Conduct

Please note that this project has a [Code of Conduct](https://github.com/npr/npr-one-api-js-sdk/tree/master/CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.


## Submitting Issues

When you're considering [submitting an issue to our GitHub repository](https://github.com/npr/npr-one-api-js-sdk/issues/new), please consider the following guidelines:

### Got a Question or Problem?

If you have questions about how to use this package, we would generally prefer that you [contact us via e-mail](mailto:NPROneEnterprise@npr.org) rather than opening a ticket. That said, if you have constructive feedback for how we can make this package better by improving the documentation, by all means, [submit an issue](https://github.com/npr/npr-one-api-js-sdk/issues/new). Please be detailed about your specific pain points, so that we're clear on what aspects of the documentation should be improved.

### Found a Bug?

If you find a bug in the source code or a mistake in the documentation, you can help us by [submitting an issue to our GitHub repository](https://github.com/npr/npr-one-api-js-sdk/issues/new). Even better, you can submit a pull request with a fix. (Please read and follow our [Development Guidelines](#contributing-to-development) before submitting your PR.)

### Want a Feature?

You can request a new feature by [submitting an issue to our GitHub repository](https://github.com/npr/npr-one-api-js-sdk/issues/new). Even for small feature requests, please submit an issue for to review before you write the code. Because this package is largely intended to function as an educational tool, the codebase will be kept as streamlined as possible and not all feature requests will be accepted. However, you are welcome to maintain a fork of our repository with any additional features you wish to add.


## Contributing to Development

If you would like to contribute to the development of this project, here is the additional information you need:

### Technology Stack

This project utilizes:

- [ES6](http://es6-features.org/) - The latest version of the ECMAScript standard
- [Babel](https://babeljs.io/) - The compiler for writing next generation JavaScript
- [Webpack](https://webpack.github.io/) - A module bundler which packs CommonJs/AMD modules for the browser

For testing:

- [Mocha](https://mochajs.org/) - A feature-rich JavaScript test framework running on Node.js and the browser
- [Chai](http://chaijs.com/) - A BDD / TDD assertion library that can be paired with any JavaScript testing framework
- [Sinon](http://sinonjs.org/) - Standalone test spies, stubs and mocks for JavaScript
- [Istanbul](https://gotwarlost.github.io/istanbul/) - A code coverage tool for JavaScript

A few other nifty tools we use as part of our development, CI and release processes:

- [ESLint](http://eslint.org/) - The pluggable linting utility for JavaScript and JSX
- [ESDoc](https://esdoc.org/) - A documentation generator for JavaScript (ES6)
- [Semantic Release](https://github.com/semantic-release/semantic-release) - Fully automated package publishing
- [Commitizen](http://commitizen.github.io/cz-cli/) - Simple commit conventions for internet citizens

### Setup

#### Prerequisites

A recent version of [node.js](http://nodejs.org) (v4.x or newer) and [npm](http://npmjs.org) installed globally on your system. (Note that to consume the SDK, only Node v0.12.x or higher is required, but because of some of our dev-dependencies, contributors need to use at least v4.x in order to produce a stable build.)

Running unit tests is possible without an NPR One API key; however, actual interaction with the NPR One API requires an OAuth2 `client_id` and a valid access token, which can be obtained by registering for an account within the [NPR One Developer Center](http://dev.npr.org/apply/).

Finally, this project is [Commitizen-friendly](https://github.com/commitizen/cz-cli) (explained in more detail [below](#committing-your-changes)) and in order to make maximum use of the tooling, we recommend you install the Commitizen CLI globally:

    [sudo] npm install -g commitizen

#### Command-Line Tasks

Tasks are setup via [package.json](https://github.com/npr/npr-one-api-js-sdk/tree/master/package.json) to be run on the command line, which help automate all the common steps for building and development. They are:

- `npm run update`: Updates all dependencies and prunes previously-installed, unused dependencies
- `npm run lint`: Runs [ESLint](http://eslint.org/) to verify compliance of source code with our Javascript coding standards
- `npm run lint:fix`: Runs [ESLint](http://eslint.org/) as above, and also fixes common problems (such as whitespace, dangling commas, etc.)
- `npm run compile`: Updates the compiled versions for both node and browser in the `dist` folder.
- `npm run compile:node`: Updates only the compiled version for node in the `dist` folder.
- `npm run compile:browser`: Updates only the compiled version for the browser in the `dist` folder.

### Coding Style

We follow a lightly modified version of the AirBnB JavaScript style guide, which is documented [in our fork](https://github.com/nprdm/javascript) of their guide. The section on [ECMAScript 6 Styles](https://github.com/nprdm/javascript#ecmascript-6-styles) is particularly relevant to this project.

Pull requests not conforming to our coding style may be asked to be updated before they are merged.

### Unit Tests

As this is a [UMD](https://github.com/umdjs/umd), the eventual goal is that testing should happen both within node.js as well a headless browser. Currently, this project has only implemented testing within node.js.

#### Running Tests

- `npm run test`: Executes all tests and displays output to the screen. Quick and efficient, this entry point is most useful when developing new tests.
- `npm run test:debug`: The same as the unit script, with logging enabled at the debug level. Useful for troubleshooting failed tests.
- `npm run coverage`: Executes all of the unit tests once and calculates code coverage.
- `npm run coverage:upload`: Executes all of the unit tests once, calculates code coverage, and uploads the results to [coveralls.io](https://coveralls.io/github/npr/npr-one-api-js-sdk). This is typically done automatically by [Travis-CI](https://travis-ci.org/npr/npr-one-api-js-sdk) and should rarely need to be done on the command line.

The test coverage report can be found at `test-reports/coverage/index.html` and is purposely excluded from source control.

### Generating Documentation

Our [full documentation](http://npr.github.io/npr-one-api-js-sdk/docs/) is generated from the ESDoc blocks within the source code files themselves using the command:

    npm run docs

The generated documentation can be found in the folder `docs/`, which is also excluded from source control.

To update the documentation on the site:

```
git checkout gh-pages       # check out the gh-pages branch
git rebase master           # make sure you have the latest changes from master
npm run update              # make sure you also pull in all necessary dependency updates
npm run docs                # actually generate the new doc files
git add -A 
git commit -m 'Update docs'
git push origin gh-pages    # ...and finally push the changes to the server 
```

GitHub will automatically update the site once changes have been pushed to the `gh-pages` branch.

### Committing Your Changes

If you're committing code or documentation with the intention of submitting a pull request, we kindly request that you follow our Git commit style. We are using the [conventional changelog](https://github.com/conventional-changelog/conventional-changelog/blob/a5505865ff3dd710cf757f50530e73ef0ca641da/conventions/angular.md) style popularized by the [AngularJS](http://angularjs.org) community. To make it easier to enforce consistency, we are strongly recommending that all contributors install the [Commitizen CLI](https://github.com/commitizen/cz-cli):

    [sudo] npm install -g commitizen

... and then, when you're ready to commit, use `git cz` instead of `git commit` (including any standard git flags such as `-A`). Commitizen will guide you through the steps to properly format your commit message.

Alternatively, if installing/using global packages isn't an option for some reason, you can also use the command line shortcut:

    npm run commit

... and then Commitizen will walk you through the rest.

### Publishing Releases

A new [release](https://github.com/npr/npr-one-api-js-sdk/releases) is published anytime code is merged into our `master` branch, which will generally only ever be done by a maintainer from within NPR. The entire process is managed by [Semantic Release](https://github.com/semantic-release/semantic-release) and does not require any manual steps, but just in case there is ever a need to publish manually, the shortcut CLI command is:

    npm run semantic-release

... but again, our automatic processes should be handling all releases, and a human should generally never have to touch a button after code is merged into `master`.
