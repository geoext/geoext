# Hints for working on GeoExt 3

> We really want that people participate in the development of GeoExt 3.
>
> Please follow these instructions to ensure that development makes fun and your
> contributions can easily be merged into the `master`-branch.


## Development setup

In order to develop GeoExt 3 you'll need certain things on your machine:

* git
* node.js & npm
* a local webserver (for browser tests that do XHR)

Additionally, if you want to reuse the GeoExt 3 library in your sencha
applications, you'll need the sencha cmd. See the [top-level README](README.md)
for more information regarding sencha.


## git & github

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

## Linting your JavaScript

Please run …

```shell
$ npm run lint-js
```

… and fix any warnings or errors produced, before you open a PR.


## Testing you code

We require that changes to the project do not break the existing testsuite. If
you add something to the library, try to add tests so it is easier to see if
everything works as expected.

We currently do not have everything tested that needs tests, so we'll need to
improve here. Any PRs in that directions are ver much welcomed!


### Running the testsuite

You can run the testsuite on the commandline:

```shell
$ # in a clone of the repository
$ npm install # only once
$ npm test
```

The testsuite can (and should) also be run in actual browsers. Host the
repository through a webserver (Apache or whatever you like), and open the URL
http://localhost:port/path/to/geoext/test

If you do nnot have a webserver, use this handy python command which will serve
the current directory on localhost:2222

```shell
$ python -m SimpleHTTPServer 2222
```


### Rerun the tests automatically when sources change

To get instant feedback whether you current edits on source or test code have the
intended effect, you can use the following commands.


#### Run the headless testsuite on source change

```shell
$ npm run test:watch
```

Changes in the `src/`- or `test/`-folder will rerun the testsuite automatically.


#### Reload the browser testsuite or examples on source change

```shell
$ npm run livereload
```

Then open the testsuite or an example and append the following hash `#reload`.

E.g. open …

  * `http://localhost:port/path/to/geoext/test/#reload` or
  * `http://localhost:port/path/to/geoext/examples/component/overviewMap.html#reload`

Changes in the `examples/`-, `src/`- or `test/`-folder will automatically reload
the pages that contain the `#reload`-hash.


## Code coverage

You can check if the unit-tests cover all relevant lines, statements, … of the
source code by issuing the following command:

```shell
$ npm run html-coverage
```

Then navigate your browser to the following URL:

* `http://localhost:port/path/to/geoext/coverage`

If you want to remove the generated artifacts (instrumented source code and
coverage), run:

```shell
$ npm run clean-coverage
```

## sencha command

### How to package GeoExt using sencha command

To generate a package you usually first create a sencha `workspace` by issuing

```
$ sencha -sdk /path/to/ext-n.n.n generate workspace /path/to/workspace
```

Inside of the workspace clone the `geoext3` repository into the `packages` subfolder:

```
$ cd /path/to/workspace/packages
$ git clone https://github.com/geoext/geoext3.git GeoExt3
$ cd GeoExt3
```

Then you can issue

```
$ sencha package build
```

Alternatively, if your source isn't living inside of a sencha workspace, you can configure the path to a workspace and then build:

```
$ sencha config --prop workspace.config.dir=/path/to/workspace/.sencha/workspace then package build
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

To use this package in a sencha app just add "GeoExt" to the "requires"-array
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

### Update the geoext package on geoext.github.io

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





