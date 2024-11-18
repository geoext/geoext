/* Copyright (c) 2015-present The Open Source Geospatial Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Provides an interface to a Mapfish or GeoServer print module.
 *
 * @class GeoExt.data.MapfishPrintProvider
 */
Ext.define('GeoExt.data.MapfishPrintProvider', {
  extend: 'Ext.Base',
  mixins: ['Ext.mixin.Observable', 'GeoExt.mixin.SymbolCheck'],
  requires: [
    'GeoExt.data.model.print.Capability',
    'Ext.data.JsonStore',
    'Ext.data.Store',
    'Ext.data.proxy.Ajax',
    'Ext.data.proxy.JsonP',
  ],
  // <debug>
  symbols: [
    'ol.Collection',
    'ol.geom.Polygon.fromExtent',
    'ol.Feature',
    'ol.layer.Layer#getSource',
    'ol.layer.Group',
    'ol.source.Vector.prototype.addFeature',
    'ol.View#calculateExtent',
  ],
  // </debug>

  /**
   * @event ready
   * Fires after the PrintCapability store is loaded.
   *
   * @param {GeoExt.data.MapfishPrintProvider} provider The
   *     GeoExt.data.MapfishPrintProvider itself
   */

  config: {
    capabilities: null,
    url: '',
    useJsonp: true,
  },

  inheritableStatics: {
    /**
     * An array of objects specifying a serializer and a connected
     * OpenLayers class. This should not be manipulated by hand, but rather
     * with the method #registerSerializer.
     *
     * @private
     */
    _serializers: [],

    /**
     * Registers the passed serializer class as an appropriate serializer
     * for the passed OpenLayers source class.
     *
     * @param {ol.source.Source} olSourceCls The OpenLayers source class
     *    that the passed serializer can serialize.
     * @param {GeoExt.data.serializer.Base} serializerCls The serializer
     *    that can serialize the passed source.
     */
    registerSerializer: function (olSourceCls, serializerCls) {
      const staticMe = GeoExt.data.MapfishPrintProvider;
      staticMe._serializers.push({
        olSourceCls: olSourceCls,
        serializerCls: serializerCls,
      });
    },

    /**
     * Unregisters the passed serializer class from the array of available
     * serializers. This may be useful if you want to register a new
     * serializer that is different from a serializer that we provide.
     *
     * @param {GeoExt.data.serializer.Base} serializerCls The serializer
     *    that can serialize the passed source.
     * @return {boolean} Whether we could unregister the serializer.
     */
    unregisterSerializer: function (serializerCls) {
      const available = GeoExt.data.MapfishPrintProvider._serializers;
      let index;
      Ext.each(available, function (candidate, idx) {
        if (candidate.serializerCls === serializerCls) {
          index = idx;
          return false; // break early
        }
      });
      if (Ext.isDefined(index)) {
        Ext.Array.removeAt(available, index);
        return true;
      }
      return false;
    },

    /**
     * Returns a GeoExt.data.serializer.Base capable of serializing the
     * passed source instance or undefined, if no such serializer was
     * previously registered.
     *
     * @param {ol.source.Source} source The source instance to find a
     *    serializer for.
     * @return {GeoExt.data.serializer.Base} A serializer for the passed
     *    source or `undefined`.
     */
    findSerializerBySource: function (source) {
      const available = GeoExt.data.MapfishPrintProvider._serializers;
      let serializer;

      Ext.each(available, function (candidate) {
        if (source instanceof candidate.olSourceCls) {
          serializer = candidate.serializerCls;
          return false; // break early
        }
      });
      if (!serializer) {
        Ext.log.warn(
          "Couldn't find a suitable serializer for source." +
            ' Did you require() an appropriate serializer class?',
        );
      }
      return serializer;
    },

    /**
     * Will return an array of ol-layers by the given collection. Layers
     * contained in `ol.layer.Group`s get extracted and groups get removed
     * from returning array
     *
     * @param {GeoExt.data.store.Layers | ol.Collection | Array<ol.layer.Base>} coll
     *     The 'collection' of layers to get as array. If passed as
     *     ol.Collection, all items must be `ol.layer.Base`.
     * @return {Array} The flat layers array.
     */
    getLayerArray: function (coll) {
      const me = this;
      let inputLayers = [];
      const outputLayers = [];

      if (coll instanceof GeoExt.data.store.Layers) {
        coll.each(function (layerRec) {
          const layer = layerRec.getOlLayer();
          inputLayers.push(layer);
        });
      } else if (coll instanceof ol.Collection) {
        inputLayers = Ext.clone(coll.getArray());
      } else {
        inputLayers = Ext.clone(coll);
      }

      inputLayers.forEach(function (layer) {
        if (layer instanceof ol.layer.Group) {
          Ext.each(me.getLayerArray(layer.getLayers()), function (subLayer) {
            outputLayers.push(subLayer);
          });
        } else {
          outputLayers.push(layer);
        }
      });
      return outputLayers;
    },

    /**
     * Will return an array of serialized layers for mapfish print servlet
     * v3.0.
     *
     * @param {GeoExt.component.Map} mapComponent The GeoExt map component
     *     to get the the layers from.
     * @param {Function} [filterFn] A function to filter the layers to be
     *     serialized.
     * @param {ol.layer.Base} filterFn.item The layer to check for
     *     inclusion.
     * @param {number} filterFn.index The index of the layer in the
     *     flattened list.
     * @param {Array} filterFn.array The complete flattened array of layers.
     * @param {boolean} filterFn.return Return a truthy value to keep the
     *     layer and serialize it.
     * @param {Object} [filterScope] The scope in which the filtering
     *     function will be executed.
     * @return {Array<Object>} An array of serialized layers.
     * @static
     */
    getSerializedLayers: function (mapComponent, filterFn, filterScope) {
      const layers = mapComponent.getLayers();
      const viewRes = mapComponent.getView().getResolution();
      const serializedLayers = [];
      let inputLayers = this.getLayerArray(layers);

      if (Ext.isDefined(filterFn)) {
        inputLayers = Ext.Array.filter(inputLayers, filterFn, filterScope);
      }

      Ext.each(
        inputLayers,
        function (layer) {
          const source = layer.getSource();
          let serialized = {};

          const serializer = this.findSerializerBySource(source);
          if (serializer) {
            serialized = serializer.serialize(
              layer,
              source,
              viewRes,
              mapComponent.map,
            );
            serializedLayers.push(serialized);
          }
        },
        this,
      );

      return serializedLayers;
    },

    /**
     * Renders the extent of the printout. Will ensure that the extent is
     * always visible and that the ratio matches the ratio that clientInfo
     * contains.
     *
     * @param {GeoExt.component.Map} mapComponent The map component to
     *     render the print extent to.
     * @param {ol.layer.Vector} extentLayer The vector layer to render the
     *     print extent to.
     * @param {Object} clientInfo Information about the desired print
     *     dimensions.
     * @param {number} clientInfo.width The target width.
     * @param {number} clientInfo.height The target height.
     * @return {ol.Feature} The feature representing the print extent.
     */
    renderPrintExtent: function (mapComponent, extentLayer, clientInfo) {
      const mapComponentWidth = mapComponent.getWidth();
      const mapComponentHeight = mapComponent.getHeight();
      const currentMapRatio = mapComponentWidth / mapComponentHeight;
      const scaleFactor = 0.6;
      const desiredPrintRatio = clientInfo.width / clientInfo.height;
      let targetWidth;
      let targetHeight;
      let geomExtent;
      let feat;

      if (desiredPrintRatio >= currentMapRatio) {
        targetWidth = mapComponentWidth * scaleFactor;
        targetHeight = targetWidth / desiredPrintRatio;
      } else {
        targetHeight = mapComponentHeight * scaleFactor;
        targetWidth = targetHeight * desiredPrintRatio;
      }

      geomExtent = mapComponent
        .getView()
        .calculateExtent([targetWidth, targetHeight]);
      feat = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent));
      extentLayer.getSource().addFeature(feat);
      return feat;
    },
  },

  /**
   * The capabiltyRec is an instance of 'GeoExt.data.model.print.Capability'
   * and contains the PrintCapabilities of the Printprovider.
   *
   * @property
   * @readonly
   */
  capabilityRec: null,

  constructor: function (cfg) {
    this.mixins.observable.constructor.call(this, cfg);
    if (!cfg.capabilities && !cfg.url) {
      Ext.Error.raise('Print capabilities or Url required');
    }
    this.initConfig(cfg);
    this.fillCapabilityRec();
  },

  /**
   * Creates the store from object or url.
   *
   * @private
   */
  fillCapabilityRec: function () {
    // enhance checks
    let store;
    const capabilities = this.getCapabilities();
    const url = this.getUrl();
    const fillRecordAndFireEvent = function () {
      this.capabilityRec = store.getAt(0);
      if (!this.capabilityRec) {
        this.fireEvent('error', this);
      } else {
        this.fireEvent('ready', this);
      }
    };
    if (capabilities) {
      // if capability object is passed
      store = Ext.create('Ext.data.JsonStore', {
        model: 'GeoExt.data.model.print.Capability',
        listeners: {
          datachanged: fillRecordAndFireEvent,
          scope: this,
        },
      });
      store.loadRawData(capabilities);
    } else if (url) {
      // if servlet url is passed
      const proxy = {
        url: url,
      };
      if (this.getUseJsonp()) {
        proxy.type = 'jsonp';
        proxy.callbackKey = 'jsonp';
      } else {
        proxy.type = 'ajax';
        proxy.reader = {
          type: 'json',
        };
      }
      store = Ext.create('Ext.data.Store', {
        autoLoad: true,
        model: 'GeoExt.data.model.print.Capability',
        proxy: proxy,
        listeners: {
          load: fillRecordAndFireEvent,
          scope: this,
        },
      });
    }
  },
});
