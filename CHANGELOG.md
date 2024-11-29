Next Version
------------

v7.0.0
------

BREAKING CHANGES:

- Updates openlayers to v10.2.0.
- The CI and tests are now tested against ExtJS 7.0.0 (updated from 6.2.0), however no breaking
  changes were found when switching between the two versions.

v6.0.0
------

BREAKING CHANGES:

Updates openlayers to v8.1.0

v5.0.0
------

BREAKING CHANGES:

Updates openlayers to v7.1.0


v4.0.0
------

BREAKING CHANGES:
- If a features store is configured with a layer this layer needs to be an `ol.layer.Vector` with an `ol.source.Vector`
with a `ol.Collection`. That means, if you used it like this before, it will now throw an Error:
```js
Ext.create('GeoExt.data.store.Features', {
  layer: new ol.layer.Vector({
    source: new ol.source.Vector()
  })
});
```
If you change it to the following code it will work and keep the elements of the store, and the layer in sync.
```js
Ext.create('GeoExt.data.store.Features', {
  layer: new ol.layer.Vector({
    source: new ol.source.Vector({
      features: new ol.Collection()
    })
  })
});
```
- The OpenLayers version was updated to v6.5.0. To use this version run `npm i ol` and include the
`ol.js` and `ol.css` files from there.
- Due to the OpenLayers update the OverviewMap no longer can use the same layers as the main map and always has to be
provided own layers.
- One of the bigger changes in OpenLayers is the removal of `opt_this` arguments. If you do not call `un` on the method
you can simply use `.bind` on the call. It you want to unbind the listener, either store a bound version of the listener
or store the listenerKey returned by `on` and usw `ol.Observable.unByKey`.
- Please refer to https://github.com/openlayers/openlayers/releases/tag/v5.0.0 and
https://github.com/openlayers/openlayers/releases/tag/v6.0.0 for overviews over the OpenLayers changes.
