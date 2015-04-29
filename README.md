# GeoExt 3

[![Build Status](https://travis-ci.org/KaiVolland/geoext3.svg?branch=master)](https://travis-ci.org/KaiVolland/geoext3) [![Coverage Status](https://coveralls.io/repos/KaiVolland/geoext3/badge.svg)](https://coveralls.io/r/KaiVolland/geoext3)

This is the first approach for an new geoext structure.

The goal is to implement upcoming geoext releases as an 
[ExtJS-Package](http://docs.sencha.com/cmd/5.x/cmd_packages/cmd_packages.html).

## Initial Codesprint
To kickstart the new GeoExt 3 project it is planned to do a code sprint in Bonn from 17th to 19th of June 2015.

[More information...](https://github.com/geoext/geoext3/wiki/GeoExt-3-Codesprint)

## How to package GeoExt using sencha command

Install `sencha cmd`: http://www.sencha.com/products/sencha-cmd/#overview (tested with the
version 6, only as preview right now).

To generate a package you usually first create a sencha `workspace` by issuing

```
$ sencha -sdk /path/to/ext-n.n.n generate workspace /path/to/workspace
```

Inside of the workspace clone the `geoext3` repository into the `packages` subfolder:

```
$ cd /path/to/workspace/packages
$ git clone https://github.com/KaiVolland/geoext3.git GeoExt3
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

## Adding GeoExt to a local sencha repository

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
#NOT WORKING AT THE MOMENT!
sencha package repo add GeoExt http://geoext.github.io/geoext3/repo
```

