# GeoExt 3

JavaScript Toolkit for Rich Web Mapping Applications.

[![Build Status](https://travis-ci.org/geoext/geoext3.svg?branch=master)](https://travis-ci.org/geoext/geoext3)
[![Coverage Status](https://coveralls.io/repos/geoext/geoext3/badge.svg?branch=master&service=github)](https://coveralls.io/github/geoext/geoext3?branch=master)
[![dependencies Status](https://david-dm.org/geoext/geoext3/status.svg)](https://david-dm.org/geoext/geoext3)
[![devDependencies Status](https://david-dm.org/geoext/geoext3/dev-status.svg)](https://david-dm.org/geoext/geoext3?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/geoext/geoext3.svg)](https://greenkeeper.io/)

[![GeoExt logo](https://geoext.github.io/geoext3/website-resources/img/GeoExt-logo.png)](https://geoext.github.io/geoext3/)

GeoExt is Open Source and enables building desktop-like GIS applications through the web. It is a JavaScript framework that combines the GIS functionality of OpenLayers with the user interface savvy of the ExtJS library provided by Sencha.

Version 3 of GeoExt is the successor to the GeoExt 2.x-series and is built atop the newest official installments of its base libraries; OpenLayers (v3.x and v4.x) and ExtJS 6.

We are trying hard to keep up with developments on both our parent libraries.
The current state of GeoExt is compatible with ExtJS 6.2.0 and OpenLayers 4.3.x. This state is released as GeoExt v3.1.0.

| OpenLayers       | ExtJS | GeoExt |
| ---------------- | ----- | ------ |
| 3.20.1           | 6.2.0 | 3.0.0  |
| 3.20.1 / 4.3.x   | 6.2.0 | 3.1.0  |

## More information on GeoExt 3

Have a look at the official homepage: https://geoext.github.io/geoext3/

You will find examples, API documentation (with and without inherited functionality from ExtJS), links to mailinglists and more over there.

> What you see on https://geoext.github.io/geoext3/ are the contents of the `gh-pages`-branch. If you encounter anything that should be fixed, please issue a pull request against that branch and we will merge it as soon as possible.

## How to use GeoExt 3 inside your Sencha app

You can use GeoExt 3 either via an `npm install @geoext/geoext` in your application folder, or (if you want the latest and greatest), you can use it from a `git clone` of this repository.

### Configuring your apps classpath

You will have to adjust the `classpath` in you `app.json` to include geoext3, like below.
Depending on how you retrieved the code from the step before, you will have to adapt the path.
When you installed geoext3 via npm, the path needs to look like `./node_modules/@geoext/geoext/src`.
Else it will be the folder where you cloned the repository into.

```javascript
    "classpath": [
        "app",
        "${toolkit.name}/src",
        "./lib/geoext3/src"
    ]
```

In the snippet above, `lib/geoext3` is a `git clone` of the GeoExt repo.

GeoExt also offers components, which are only compatible with the classic
toolkit of ExtJS (e.g. `StateProvider` or `GeocoderCombo`).
In case you want to use them you also have to add the `classic` folder to the
`classpath`. So your complete `classpath` definition could look like below:

```javascript
    "classpath": [
        "app",
        "${toolkit.name}/src",
        "./lib/geoext3/src",
        "./lib/geoext3/classic"
    ]
```

To help with your first GeoExt 3 project, follow the instructions provided to build a [GeoExt 3 Universal app](universal-app.md). This app runs on the desktop and on mobile.

## Examples

### Classic Toolkit

https://geoext.github.io/geoext3/master/examples/component/map.html

* [Basic map component](https://geoext.github.io/geoext3/master/examples/component/map.html)
* [Overview component](https://geoext.github.io/geoext3/master/examples/component/overviewMap.html)
* [Basic TreePanel](https://geoext.github.io/geoext3/master/examples/tree/panel.html)
* [Legends in Treepanels](https://geoext.github.io/geoext3/master/examples/tree/tree-legend-simple.html)
* [Basic print with Mapfish v3](http://rawgit.com/geoext/geoext3/master/examples/print/basic-mapfish.html)
* [Popup on a map component](https://geoext.github.io/geoext3/master/examples/popup/gx-popup.html)
* [FeatureGrid component](https://geoext.github.io/geoext3/master/examples/features/grid.html)
* [Interactively filtered heatmap](https://geoext.github.io/geoext3/master/examples/filtered-heatmap/filtered-heatmap.html)
* [FeatureRenderer component](https://geoext.github.io/geoext3/master/examples/renderer/renderer.html)
* [MapView form](https://geoext.github.io/geoext3/master/examples/mapviewform/mapviewform.html)

### Modern Toolkit

* [Basic map component ](https://geoext.github.io/geoext3/master/examples/modern-map/modern-map.html)
* [LayerList component ](https://geoext.github.io/geoext3/master/examples/modern-layerlist/modern-layerlist.html)


## Want to contribute? Yes, please 😀

Read the [hints for developers](development.md) to get started. We look forward
to your contributions!

## Initial Codesprint

To kickstart the new GeoExt 3 project a code sprint has been done in Bonn from 17th to 19th of June 2015. For more informations check the following links:  [Code sprint WIKI page](https://github.com/geoext/geoext3/wiki/GeoExt-3-Codesprint), [Official blog post of code sprint day 1](http://geoext.blogspot.de/2015/06/geoext-is-getting-3.html), [Official blog post of the code sprint days 2 and 3](http://geoext.blogspot.de/2015/06/geoext-3-codesprint-day-2-and-3.html)
