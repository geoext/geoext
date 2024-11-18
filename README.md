# GeoExt

JavaScript Toolkit for Rich Web Mapping Applications.

[![Build Status](https://travis-ci.org/geoext/geoext.svg?branch=master)](https://travis-ci.org/geoext/geoext)
[![Coverage Status](https://coveralls.io/repos/geoext/geoext/badge.svg?branch=master&service=github)](https://coveralls.io/github/geoext/geoext?branch=master)
[![dependencies Status](https://david-dm.org/geoext/geoext/status.svg)](https://david-dm.org/geoext/geoext)
[![devDependencies Status](https://david-dm.org/geoext/geoext/dev-status.svg)](https://david-dm.org/geoext/geoext?type=dev)

[![GeoExt logo](https://geoext.github.io/geoext/website-resources/img/GeoExt-logo.png)](https://geoext.github.io/geoext/)

GeoExt is Open Source and enables building desktop-like GIS applications through the web. It is a JavaScript framework that combines the GIS functionality of OpenLayers with the user interface savvy of the ExtJS library provided by Sencha.

Version 3 of GeoExt was the successor to the GeoExt 2.x-series and has been built atop the following versions of its base libraries: OpenLayers v3.x / v4.x and ExtJS 6.

With version 4 GeoExt supports the newest official installment v6.x of OpenLayers and ExtJS 6.2.

We are trying hard to keep up with developments on both our parent libraries.
The current state of GeoExt is compatible with ExtJS 6.2.0 and OpenLayers 7.1.0. This state is released as GeoExt v4.0.0.

| OpenLayers       | ExtJS | GeoExt         |
| ---------------- | ----- | -------------- |
| 10.1.0           | 7.0.0 | 7.0.x         |
| 8.1.0            | 6.2.0 | 6.0.x          |
| 7.1.0            | 6.2.0 | 5.0.x          |
| 6.5.0            | 6.2.0 | 4.0.x          |
| 4.6.5            | 6.2.0 | 3.4.0 & 3.3.x & 3.2.0  |
| 3.20.1 / 4.3.x   | 6.2.0 | 3.1.0          |
| 3.20.1           | 6.2.0 | 3.0.0          |

## More information on GeoExt

Have a look at the official homepage: https://geoext.github.io/geoext/

You will find examples, API documentation (with and without inherited functionality from ExtJS), links to mailinglists and more over there.

> What you see on https://geoext.github.io/geoext/ are the contents of the `gh-pages`-branch. If you encounter anything that should be fixed, please issue a pull request against that branch and we will merge it as soon as possible.

## How to use GeoExt inside your Sencha app

You can use GeoExt either via an `npm install @geoext/geoext` in your application folder, or (if you want the latest and greatest), you can use it from a `git clone` of this repository.

### Configuring your apps classpath

You will have to adjust the `classpath` in you `app.json` to include geoext, like below.
Depending on how you retrieved the code from the step before, you will have to adapt the path.
When you installed geoext via npm, the path needs to look like `./node_modules/@geoext/geoext/src`.
Else it will be the folder where you cloned the repository into.

```javascript
    "classpath": [
        "app",
        "${toolkit.name}/src",
        "./lib/geoext/src"
    ]
```

In the snippet above, `lib/geoext` is a `git clone` of the GeoExt repo.

GeoExt also offers components, which are only compatible with the classic
toolkit of ExtJS (e.g. `StateProvider` or `GeocoderCombo`).
In case you want to use them you also have to add the `classic` folder to the
`classpath`. So your complete `classpath` definition could look like below:

```javascript
    "classpath": [
        "app",
        "${toolkit.name}/src",
        "./lib/geoext/src",
        "./lib/geoext/classic"
    ]
```

To help with your first GeoExt project, follow the instructions provided to build a [GeoExt Universal app](universal-app.md). This app runs on the desktop and on mobile.

## Examples

### Classic Toolkit

https://geoext.github.io/geoext/master/examples/component/map.html

* [Basic map component](https://geoext.github.io/geoext/master/examples/component/map.html)
* [Overview component](https://geoext.github.io/geoext/master/examples/component/overviewMap.html)
* [Basic TreePanel](https://geoext.github.io/geoext/master/examples/tree/panel.html)
* [Legends in Treepanels](https://geoext.github.io/geoext/master/examples/tree/tree-legend-simple.html)
* [Basic print with Mapfish v3](https://geoext.github.io/geoext/master/examples/print/basic-mapfish.html)
* [Popup on a map component](https://geoext.github.io/geoext/master/examples/popup/gx-popup.html)
* [FeatureGrid component](https://geoext.github.io/geoext/master/examples/features/grid.html)
* [Interactively filtered heatmap](https://geoext.github.io/geoext/master/examples/filtered-heatmap/filtered-heatmap.html)
* [FeatureRenderer component](https://geoext.github.io/geoext/master/examples/renderer/renderer.html)
* [MapView form](https://geoext.github.io/geoext/master/examples/mapviewform/mapviewform.html)

### Modern Toolkit

* [Basic map component ](https://geoext.github.io/geoext/master/examples/modern-map/modern-map.html)
* [LayerList component ](https://geoext.github.io/geoext/master/examples/modern-layerlist/modern-layerlist.html)


## Want to contribute? Yes, please 😀

Read the [hints for developers](CONTRIBUTING.md) to get started. We look forward
to your contributions!

## Initial Codesprint

The GeoExt 3 project was kickstarted during a code sprint in Bonn from 17th to 19th of June 2015. 
For more informations check the following links:
[Code sprint WIKI page](https://github.com/geoext/geoext/wiki/GeoExt-3-Codesprint), 
[Official blog post of code sprint day 1](http://geoext.blogspot.de/2015/06/geoext-is-getting-3.html), 
[Official blog post of the code sprint days 2 and 3](http://geoext.blogspot.de/2015/06/geoext-3-codesprint-day-2-and-3.html)

---------

<a href="https://www.osgeo.org/projects/geoext/">
<img src="https://geoext.github.io/geoext/website-resources/img/OSGeo_community.png" alt="OSGeo Community Project" width="200" />
</a>

GeoExt is an OSGeo Community project
