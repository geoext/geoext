# GeoExt 3

JavaScript Toolkit for Rich Web Mapping Applications.

[![Build Status](https://travis-ci.org/geoext/geoext3.svg?branch=master)](https://travis-ci.org/geoext/geoext3) [![Coverage Status](https://coveralls.io/repos/geoext/geoext3/badge.svg?branch=master&service=github)](https://coveralls.io/github/geoext/geoext3?branch=master)

GeoExt is Open Source and enables building desktop-like GIS applications through the web. It is a JavaScript framework that combines the GIS functionality of OpenLayers with the user interface savvy of the ExtJS library provided by Sencha.

Version 3 of GeoExt is the successor to the GeoExt 2.x-series and is built atop the newest official installments of its base libraries; OpenLayers 3 and ExtJS 6.

Geoext 3 is not released yet, and we are actively developing it. Right now it is neither feature complete, nor fully tested. Everybody is invited to help us create the next version of GeoExt. 

The goal is to implement upcoming GeoExt releases as an 
[ExtJS-Package](http://docs.sencha.com/cmd/5.x/cmd_packages/cmd_packages.html).

##More information on GeoExt 3

Have a look at the official homepage: http://geoext.github.io/geoext3/

You will find examples, API documentation (with and without inherited functionality from ExtJS), links to mailinglists and more over there.

What you see on http://geoext.github.io/geoext3/ are the contents of the gh-pages-branch. If you encounter anything that should be fixed, please issue a pull request against that branch and we will merge it as soon as possible.

## Initial Codesprint

To kickstart the new GeoExt 3 project a code sprint has been done in Bonn from 17th to 19th of June 2015.
For more informations check the following links:

[Code sprint WIKI page](https://github.com/geoext/geoext3/wiki/GeoExt-3-Codesprint)

[Official blog post of code sprint day 1](http://geoext.blogspot.de/2015/06/geoext-is-getting-3.html)

[Official blog post of the code sprint days 2 and 3](http://geoext.blogspot.de/2015/06/geoext-3-codesprint-day-2-and-3.html)

## Use GeoExt 3 inside your Sencha app

Install `sencha cmd`: http://www.sencha.com/products/sencha-cmd/#overview

First, add the remote repository

```
sencha package repo add GeoExt http://geoext.github.io/geoext3/cmd/pkgs
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

That's it, you can then use GeoExt components in your app. We strive to update
this package regularily, while we are developing. If you want to get a newer
version of the GeoExt package, you have to do the following

* In your application: Remove the `packages/remote/GeoExt` folder
* In your local package cache (`path/to/Sencha/Cmd/repo/pkgs`): Remove the
  `GeoExt` folder
* In your application issue `sencha app refresh`

## Examples

* [Basic map component](http://rawgit.com/geoext/geoext3/master/examples/component/map.html)
* [Overview component](http://rawgit.com/geoext/geoext3/master/examples/component/overviewMap.html)
* [Basic TreePanel](http://rawgit.com/geoext/geoext3/master/examples/tree/panel.html)
* [Legends in Treepanels](http://rawgit.com/geoext/geoext3/master/examples/tree/tree-legend-simple.html)
* [Basic print with Mapfish v3](http://rawgit.com/geoext/geoext3/master/examples/print/basic-mapfish.html)
* [Popup on a map component](http://rawgit.com/geoext/geoext3/master/examples/popup/gx-popup.html)
* [FeatureGrid component](http://rawgit.com/geoext/geoext3/master/examples/features/grid.html)


## Want to contribute? Yes, please 😀

Read the [hints for developers](development.md) to get started. We look forward
to your contributions!

