# Hints for working on GeoExt 3

> We really want that people participate in the development of GeoExt 3.
>
> Please follow these instructions to ensure that development makes fun and your
> contributions can easily be merged into the `master`-branch.


## Development setup

In order to develop GeoExt 3 you'll need certain things on your machine:

* [`git`](https://git-scm.com)
* [Node.js & `npm`](https://nodejs.org/en/)
* [`jsduck`](https://github.com/senchalabs/jsduck)

Additionally, if you want to reuse the GeoExt 3 library in your Sencha
applications, you'll need the Sencha CMD tool. See the
[top-level README](README.md) for more information regarding `sencha`.

## Install required development dependencies

GeoExt3 comes prepared with some scripts and a testing environment. To use it,
you'll need to install some dependencies that are declared in the `package.json`
file of the project folder. With `npm` installed (see information above) simply
run `npm install` in the project root once after checking out from GitHub.

## Provided `npm` scripts

There are a number of preconfigured scripts, listed in package.json, that can be 
executed via `npm run-script TARGET` from the base directory of the repository:

* `clean` removes generated files and folders.
* `lint` checks code for linting errors.
* `test` runs the headless test suite. This will also download some external
resources if needed. If you do not want a progress bar being rendered during
the download phase, just set the environment variable `NO_DOWNLOAD_PROGRESS`
to `true` like so: `NO_DOWNLOAD_PROGRESS=true npm test`.
* `test:debug` runs the headless test suite with ExtJS in debug mode.
* `test:coverage` runs the headless test suite only outputting coverage files.
* `test:watch` runs the test suite when changes in the `src` or `test`
directories are detected (end via `CTRL+C`).
* `test:watch:debug` is the same as `test:watch` but loads ExtJS in debug mode.
* `start` starts a web server for local development on port 3000. When changes
to the source code are detected, the browser page is reloaded (end via
  `CTRL+C`).
* `coveralls` is used by the continues integration platform
[Travis CI](https://travis-ci.org/geoext/geoext3) to upload coverage info to
[Coveralls.io](https://coveralls.io/github/geoext/geoext3)
* `generate:example`generates a sample application in the examples folder. Use
this to start a new feature example for GeoExt3.
* `generate:docs` generates an API documentation that you can access in the
browser via `/apidocs/index.html`. (requires the external `jsduck` command)

Make sure to run `npm install` before using these scripts as this will install
required dependencies locally.

## Git & GitHub

Please always work on a feature branch, and submit pull requests (PR) from
there. Your commit messages should follow the following format:

```
Headline explaining in max. 50 chars the commit

After a blank line, you can include more details about the commit. Lines here
have a maximum length of 80 characters.

You can have many paragraphs here, lists are done

* like
* this

The nice thing with github is, if you only have one commit with a message
formatted like described here, and then open a PR, the title and body of the PR
will contain this information already.
```

Headlines usually start with an active verb in present tense:

```
Bad:  This fixed the sync issue of map/overview
Good: Fix syncronisation of map and overview
```

Please avoid useless merges in your PR history, and instead try to rebase your
changes on the latest master.

Don't worry, if this sounds like a lot of hassle; we'll sort any possible
problems out together.

## Running a local development server

To start working on GeoExt3, checking out the example applications and running
the test suite in your browser, you can use the `npm start` command. This will
fire up a local development server with it's content root set to the projects
root folder. The browser page is reloaded if changes in the source or test
directory are detected.

Alternatively, you may use any other web server of your choice.

## Linting your JavaScript

Please run …

```shell
$ npm run-script lint
```

… and fix any warnings or errors produced, before you open a PR.


## Testing

We require that changes to the project do not break the existing test suite. If
you add something to the library, try to add tests so it is easier to see if
everything works as expected.

We currently do not have everything tested that needs tests, so we'll need to
improve here. Any PRs in that directions are very much welcomed!


### Running the test suite

You can run the test suite on the commandline:

```shell
$ # in a clone of the repository
$ npm install # only once
$ npm test
```

The test suite can (and should) also be run in actual browsers. To do so, run
`npm start` to fire up a local development server and browse to the
[test suites index file](http:localhost:3000/test/index.html).

### Rerun the tests automatically when sources change

To get instant feedback whether you current edits on source or test code have
the intended effect, you can use the following commands.


#### Run the headless test suite on source change

```shell
$ npm run-script test:watch
```

Changes in the `src/`- or `test/`-folder will rerun the test suite
automatically.

Running the test suite generates coverage reports in the `coverage/` subdir.

If you want to remove the generated artifacts:

```shell
$ npm run-script clean
```

#### Running the test suite in a browser

```shell
$ cd test
$ karma start --browsers Chrome --single-run=False --debug --auto-watch
```

## Sencha CMD

### How to package GeoExt using Sencha CMD

To generate a package you usually first create a Sencha `workspace` by issuing

```
$ sencha -sdk /path/to/ext-n.n.n generate workspace /path/to/workspace
```

Inside of the workspace clone the `geoext3` repository into the `packages`
subfolder:

```
$ cd /path/to/workspace/packages
$ git clone https://github.com/geoext/geoext3.git GeoExt3
$ cd GeoExt3
```

Then you can issue

```
$ sencha package build
```

Alternatively, if your source isn't living inside of a Sencha workspace, you can
 configure the path to a workspace and then build:

```
$ sencha config --prop workspace.config.dir=/path/to/workspace/.sencha/workspace
then package build
```

### Adding GeoExt to a local sencha repository

Initalize the local "GeoExt Contributors" repository:

```
$ sencha package repo init -name "GeoExt Contributors" -email "dev@geoext.org"
```

Add the package to this repository:

```
$ sencha package add /path/to/workspace/build/GeoExt/GeoExt.pkg
```

To use this package in a Sencha app just add "GeoExt" to the "requires"-array
in your app.json:

```javascript
    /**
     * The list of required packages (with optional versions; default is "latest").
     *
     * For example,
     *
     *      "requires": [
     *          "charts"
     *      ]
     */
    "requires": [
        "GeoExt"
    ],
```


In the future we will most probably host the package on a remote resource so
that you can do:

```
sencha package repo add GeoExt http://geoext.github.io/geoext3/cmd/pkgs
```

### Update the `geoext` package on geoext.github.io

*Untested*: First add GeoExt to your local repository, then find the repo on
your machine, it is usually located near the `sencha` executable, e.g.

```
cd path/to/Sencha/Cmd/repo/pkgs
```

You should see a `GeoExt` folder there.

Next, checkout the `gh-pages` -branch

```
git checkout gh-pages
```

Update the `cmd/pkgs/GeoExt` folder with the contents of the
`path/to/Sencha/Cmd/repo/pkgs/GeoExt` folder, then commit and push to upstream.


## Contributor Agreement

Prior to accepting substantial changes, we need you to sign the [Contributor
Agreement](http://trac.geoext.org/browser/docs/contributor_agreements/geoext_agreement.pdf?format=raw)
of the project.
