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
 * A data store holding OpenLayers feature objects.
 *
 * @class
 */
Ext.define('GeoExt.data.store.Features', {
    extend: 'GeoExt.data.store.Collection',
    requires: [],

    model: 'GeoExt.data.model.Feature',

    config: {

        /**
         * @cfg {ol.Layer}
         * Initial layer holding features which will be added to the store
         */
        /**
         * @property {ol.Layer}
         * @readonly
         * The layer object which is in sync with this store
         */
        layer: null
    },

    /**
     * @cfg {ol.Map}
     * a map object to which a possible #layer will be added
     */
    map: null,

    /**
     * @cfg
     * Set this flag to true will create a vector #layer with the given
     * #features and ads it to the given #map (if available)
     */
    createLayer: false,

    /**
     * @private
     * @property
     * Shows if the #layer has been created by constructor
     */
    layerCreated: false,

    /**
     * @cfg {ol.Style}
     * An OpenLayers 3 style object to style the vector #layer representing
     * the features of this store
     */
    style: null,

    /**
     * @cfg {ol.Collection<ol.Feature>}
     * Initial set of features. Has to be an ol.Collection object with
     * ol.Feature objects in it.
     */
    features: null,


    /**
     * @private
     */
    constructor: function(config) {
        var me = this,
            cfg = config || {};

        if (me.style === null) {
            me.style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({
                        color: '#3399CC'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2
                    })
                })
            });
        }

        if(cfg.features) {
            cfg.data = cfg.features;
        } else if(cfg.layer && cfg.layer instanceof ol.layer.Vector) {
            if(cfg.layer.getSource()) {
                cfg.data = cfg.layer.getSource().getFeatures();
            } else {
                cfg.data = [];
            }
        }

        me.callParent([cfg]);

        // create a vector layer and add to map if configured accordingly
        if (me.createLayer === true && !me.layer) {
            me.drawFeaturesOnMap();
        }

        me.bindLayerEvents();
    },

    /**
     * Returns the FeatureCollection which is in sync with this store.
     *
     * @returns {ol.Collection<ol.Featrues>}
     *   The underlying OpenLayers FeatureCollection
     */
    getFeatures: function() {
        return this.olCollection;
    },

    /**
     * Returns the record corresponding to a feature.
     *
     * @param  {ol.Feature} feature An ol.Feature object to get the record for
     * @return {Ext.data.Model} The model instance corresponding to the feature
     */
    getByFeature: function(feature) {
        return this.getAt(this.findBy(function(record) {
            return record.getFeature() === feature;
        }));
    },

    /**
     * @protected
     *
     * Overwrites the destroy function to ensure the #layer is removed from
     * the #map when it has been created automatically while construction in
     * case of destruction of this store.
     */
    destroy: function() {
        var me = this;
        if (me.map && me.layerCreated === true) {
            me.map.removeLayer(me.layer);
        }

        me.callParent(arguments);
    },

    /**
     * @private
     *
     * Draws the given #features on the #map
     */
    drawFeaturesOnMap: function() {
        var me = this;

        // create a layer representation of our features
        me.source = new ol.source.Vector({
            features: me.getFeatures()
        });
        me.layer = new ol.layer.Vector({
            source: me.source,
            style: me.style
        });
        // add layer to connected map, if available
        if(me.map) {
            me.map.addLayer(me.layer);
        }

        me.layerCreated = true;
    },

    /**
     * Bind the 'addfeature' and 'removefeature' events to sync the features
     * in #layer with this store.
     *
     *  @private
     */
    bindLayerEvents: function () {
        var me = this;
        if(me.layer && me.layer.getSource() instanceof ol.source.Vector) {
            // bind feature add / remove events of the layer
            me.layer.getSource().on('addfeature', me.onFeaturesAdded, me);
            me.layer.getSource().on('removefeature', me.onFeaturesRemoved, me);
        }
    },

    /**
     * Handler for #layer 'addfeature' event
     *
     * @param  {Object} evt the event object of OpenLayers
     * @private
     */
    onFeaturesAdded: function (evt) {
        this.add(evt.feature);
    },

    /**
     * Handler for #layer 'removefeature' event
     *
     * @param  {Object} evt the event object of OpenLayers
     * @private
     */
    onFeaturesRemoved: function (evt) {
        var me = this;
        if (!me._removing) {
            var record = me.getByFeature(evt.feature);
            if (record) {
                me._removing = true;
                me.remove(record);
                delete me._removing;
            }
        }
    }

});
