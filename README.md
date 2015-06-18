# GeoExt 3

[![Build Status](https://travis-ci.org/geoext/geoext3.svg?branch=master)](https://travis-ci.org/geoext/geoext3) [![Coverage Status](https://coveralls.io/repos/geoext/geoext3/badge.svg)](https://coveralls.io/r/geoext/geoext3)

This is the first approach for an new geoext structure.

The goal is to implement upcoming geoext releases as an 
[ExtJS-Package](http://docs.sencha.com/cmd/5.x/cmd_packages/cmd_packages.html).

## Initial Codesprint
To kickstart the new GeoExt 3 project it is planned to do a code sprint in Bonn from 17th to 19th of June 2015.

[More information...](https://github.com/geoext/geoext3/wiki/GeoExt-3-Codesprint)

## Use GeoExt inside your sencha app

Install `sencha cmd`: http://www.sencha.com/products/sencha-cmd/#overview (tested with the
version 6, only as preview right now).

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


## Want to contribute? Yes, please 😀

Read the [hints for developers](development.md) to get started. We look forward
to your contributions!

