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


## Contributor Agreement

Prior to accepting substantial changes, we need you to sign the [Contributor
Agreement](http://trac.geoext.org/browser/docs/contributor_agreements/geoext_agreement.pdf?format=raw)
of the project.





