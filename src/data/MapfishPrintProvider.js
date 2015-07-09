/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 */
Ext.define('GeoExt.data.MapfishPrintProvider', {
    extend: 'Ext.Base',
    mixins: ['Ext.mixin.Observable'],
    requires: [
        'GeoExt.data.model.print.Capability',
        'Ext.data.JsonStore'
    ],

    /**
     * @event ready
     * Fires after the PrintCapability store is loaded.
     * @param {GeoExt.data.MapfishPrintProvider} provider
     * The GeoExt.data.MapfishPrintProvider itself
     */

    config: {
        capabilities: null,
        url: ''
    },

    statics: {
        /**
         * Will return an array of serialized layers for mapfish print servlet
         * v3.0.
         *
         * @param {GeoExt.data.LayerStore, {ol.Collection.<ol.layer.Base>},
         * Array<ol.layer.Base>}
         *
         * @static
         */
        getSerializedLayers: function(layers){
            var serializedLayers = [];
            var inputLayers = [];

            if(layers instanceof GeoExt.data.LayerStore){
                layers.each(function(layerRec) {
                    var layer = layerRec.getOlLayer();
                    inputLayers.push(layer);
                });
            } else if (layers instanceof ol.Collection){
                inputLayers = layers.getArray();
            } else {
                inputLayers = layers;
            }

            Ext.each(inputLayers, function(layer){
                var source = layer.getSource();
                var serialized = {};
                if (source instanceof ol.source.TileWMS) {
                    serialized = {
                        "baseURL": source.getUrls()[0],
                        "customParams": source.getParams(),
                        "layers": [
                            source.getParams().LAYERS
                        ],
                        "opacity": layer.getOpacity(),
                        "styles": [ "" ],
                        "type": "WMS"
                    };
                    serializedLayers.push(serialized);
                } else if (source instanceof ol.source.ImageWMS){
                    serialized = {
                        "baseURL": source.getUrl(),
                        "customParams": source.getParams(),
                        "layers": [
                            source.getParams().LAYERS
                        ],
                        "opacity": layer.getOpacity(),
                        "styles": [ "" ],
                        "type": "WMS"
                    };
                    serializedLayers.push(serialized);
                } else {
                    // TODO implement serialization of other ol.source classes.
                }
            });

            return serializedLayers;
        },

        /**
         * Renders the extent of the printout. Will ensure that the extent is
         * always visible and that the ratio matches the ratio that clientInfo
         * contains
         */
        renderPrintExtent: function(mapComponent, extentLayer, clientInfo){
            var mapComponentWidth = mapComponent.getWidth();
            var mapComponentHeight = mapComponent.getHeight();
            var currentMapRatio = mapComponentWidth / mapComponentHeight;
            var scaleFactor = 0.6;
            var desiredPrintRatio = clientInfo.width / clientInfo.height;
            var targetWidth;
            var targetHeight;
            var geomExtent;
            var feat;

            if (desiredPrintRatio >= currentMapRatio){
                targetWidth = mapComponentWidth * scaleFactor;
                targetHeight = targetWidth / desiredPrintRatio;
            } else {
                targetHeight = mapComponentHeight * scaleFactor;
                targetWidth = targetHeight * desiredPrintRatio;
            }

            geomExtent = mapComponent.getView().calculateExtent([
                targetWidth,
                targetHeight
            ]);
            feat = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent));
            extentLayer.getSource().addFeature(feat);
            return feat;
        }
    },

    /**
     * @property
     * The capabiltyRec is an instance of 'GeoExt.data.model.print.Capability'
     * and contains the PrintCapabilities of the Printprovider.
     * @readonly
     */
    capabilityRec: null,

    constructor: function(cfg){
        this.mixins.observable.constructor.call(this, cfg);
        if (!cfg.capabilities && !cfg.url) {
            Ext.Error.raise('Print capabilities or Url required');
        }
        this.initConfig(cfg);
        this.fillCapabilityRec();
    },

    /**
     * @private
     * Creates the store from object or url.
     */
    fillCapabilityRec: function(){
        // enhance checks
        var store;
        var capabilities = this.getCapabilities();
        var url = this.getUrl();
        var fillRecordAndFireEvent = function(){
            this.capabilityRec = store.getAt(0);
            this.fireEvent('ready', this);
        };
        if (capabilities) { // if capability object is passed
            store = Ext.create('Ext.data.JsonStore', {
                model: 'GeoExt.data.model.print.Capability',
                listeners: {
                    datachanged: fillRecordAndFireEvent,
                    scope: this
                }
            });
            store.loadRawData(capabilities);
        } else if (url){ // if servlet url is passed
            store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                model: 'GeoExt.data.model.print.Capability',
                proxy: {
                    type: 'jsonp',
                    url: url,
                    callbackKey: 'jsonp'
                },
                listeners: {
                    load: fillRecordAndFireEvent,
                    scope: this
                }
            });
        }
    }
});
