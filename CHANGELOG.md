Next Version
------------

BREAKING CHANGES:
- The OpenLayers version was updated to v6.5.0. To use this version run `npm i @geoext/openlayers-legacy` and include the
`ol.js` and `ol.css` files from there.
- Due to the OpenLayers update the OverviewMap no longer can use the same layers as the main map and always has to be
provided own layers.
- One of the bigger changes in OpenLayers is the removal of `opt_this` arguments. If you do not call `un` on the method
you can simply use `.bind` on the call. It you want to unbind the listener, either store a bound version of the listener
or store the listenerKey returned by `on` and usw `ol.Observable.unByKey`.
- Please refer to https://github.com/openlayers/openlayers/releases/tag/v5.0.0 and
https://github.com/openlayers/openlayers/releases/tag/v6.0.0 for overviews over the OpenLayers changes.
