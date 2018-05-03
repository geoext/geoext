/* Copyright (c) 2015-2017 The Open Source Geospatial Foundation
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
 * A data store holding OpenLayers feature objects (`ol.Feature`).
 *
 * @class GeoExt.data.store.Features
 */
Ext.define('GeoExt.data.store.Features', {
    extend: 'GeoExt.data.store.OlObjects',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.Collection',
        'ol.layer.Vector',
        'ol.Map',
        'ol.Map#addLayer',
        'ol.Map#removeLayer',
        'ol.source.Vector',
        'ol.source.Vector#getFeatures',
        'ol.source.Vector#on',
        'ol.source.Vector#un',
        'ol.style.Circle',
        'ol.style.Fill',
        'ol.style.Stroke',
        'ol.style.Style'
    ],
    // </debug>

    model: 'GeoExt.data.model.Feature',

    config: {

        /**
         * Initial layer holding features which will be added to the store.
         *
         * @cfg {ol.Layer} layer
         */
        /**
         * The layer object which is in sync with this store.
         * @property {ol.Layer}
         * @readonly
         */
        layer: null
    },

    /**
     * A map object to which a possible #layer will be added.
     *
     * @cfg {ol.Map}
     */
    map: null,

    /**
     * Setting this flag to `true` will create a vector #layer with the
     * given #features and adds it to the given #map (if available).
     *
     * @cfg {Boolean}
     */
    createLayer: false,

    /**
     * Shows if the #layer has been created by constructor.
     *
     * @private
     * @property {Boolean}
     */
    layerCreated: false,

    /**
     * An OpenLayers 3 style object to style the vector #layer representing
     * the features of this store.
     *
     * @cfg {ol.Style}
     */
    style: null,

    /**
     * Initial set of features. Has to be an `ol.Collection` object with
     * `ol.Feature` objects in it.
     *
     * @cfg {ol.Collection}
     */
    features: null,

    /**
     * Setting this flag to true the filter of the store will be
     * applied to the underlying vector #layer.
     * This will only have an effect if the source of the #layer is NOT
     * configured with an 'url' parameter.
     *
     * @cfg {Boolean}
     */
    passThroughFilter: false,


    /**
     * Constructs the feature store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        var me = this;
        var cfg = config || {};

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

        if (cfg.features) {
            cfg.data = cfg.features;
        } else if (cfg.layer && cfg.layer instanceof ol.layer.Vector) {
            if (cfg.layer.getSource()) {
                cfg.data = cfg.layer.getSource().getFeatures();
            }
        }

        if (!cfg.data) {
            cfg.data = new ol.Collection();
        }

        me.callParent([cfg]);

        // create a vector layer and add to map if configured accordingly
        if (me.createLayer === true && !me.layer) {
            me.drawFeaturesOnMap();
        }

        if (cfg.features instanceof ol.Collection) {
            this.olCollection.on('add', this.onOlCollectionAdd, this);
            this.olCollection.on('remove', this.onOlCollectionRemove, this);
        }
        me.bindLayerEvents();

        if (me.passThroughFilter === true) {
            me.on('filterchange', me.onFilterChange);
        }
    },

    /**
     * Forwards changes to the `ol.Collection` to the Ext.data.Store.
     *
     * @param {ol.CollectionEvent} evt The event emitted by the `ol.Collection`.
     * @private
     */
    onOlCollectionAdd: function(evt) {
        var target = evt.target;
        var element = evt.element;
        var idx = Ext.Array.indexOf(target.getArray(), element);

        if (!this.__updating) {
            this.insert(idx, element);
        }
    },

    /**
     * Forwards changes to the `ol.Collection` to the Ext.data.Store.
     *
     * @param {ol.CollectionEvent} evt The event emitted by the `ol.Collection`.
     * @private
     */
    onOlCollectionRemove: function(evt) {
        var element = evt.element;
        var idx = this.findBy(function(rec) {
            return rec.olObject === element;
        });

        if (idx !== -1) {
            if (!this.__updating) {
                this.removeAt(idx);
            }
        }
    },

    applyFields: function(fields) {
        var me = this;
        if (fields) {
            this.setModel(
                Ext.data.schema.Schema.lookupEntity(me.config.model)
            );
        }
    },

    /**
     * Returns the FeatureCollection which is in sync with this store.
     *
     * @return {ol.Collection} The underlying OpenLayers `ol.Collection` of
     *     `ol.Feature`.
     */
    getFeatures: function() {
        return this.olCollection;
    },

    /**
     * Returns the record corresponding to a feature.
     *
     * @param {ol.Feature} feature An ol.Feature object to get the record for
     * @return {Ext.data.Model} The model instance corresponding to the feature
     */
    getByFeature: function(feature) {
        return this.getAt(this.findBy(function(record) {
            return record.getFeature() === feature;
        }));
    },

    /**
     * Overwrites the destroy function to ensure the #layer is removed from
     * the #map when it has been created automatically while construction in
     * case of destruction of this store.
     *
     * @protected
     */
    destroy: function() {
        if (this.olCollection) {
            this.olCollection.un('add', this.onCollectionAdd, this);
            this.olCollection.un('remove', this.onCollectionRemove, this);
        }

        var me = this;

        me.unbindLayerEvents();

        if (me.map && me.layerCreated === true) {
            me.map.removeLayer(me.layer);
        }

        me.callParent(arguments);
    },

    /**
     * Draws the given #features on the #map.
     *
     * @private
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
        if (me.map) {
            me.map.addLayer(me.layer);
        }

        me.layerCreated = true;
    },

    /**
     * Bind the 'addfeature' and 'removefeature' events to sync the features
     * in #layer with this store.
     *
     * @private
     */
    bindLayerEvents: function() {
        var me = this;
        if (me.layer && me.layer.getSource() instanceof ol.source.Vector) {
            // bind feature add / remove events of the layer
            me.layer.getSource().on('addfeature', me.onFeaturesAdded, me);
            me.layer.getSource().on('removefeature', me.onFeaturesRemoved, me);
        }
    },

    /**
     * Unbind the 'addfeature' and 'removefeature' events of the #layer.
     *
     * @private
     */
    unbindLayerEvents: function() {
        var me = this;
        if (me.layer && me.layer.getSource() instanceof ol.source.Vector) {
            // unbind feature add / remove events of the layer
            me.layer.getSource().un('addfeature', me.onFeaturesAdded, me);
            me.layer.getSource().un('removefeature', me.onFeaturesRemoved, me);
        }
    },

    /**
     * Handler for #layer 'addfeature' event.
     *
     * @param {Object} evt The event object of OpenLayers.
     * @private
     */
    onFeaturesAdded: function(evt) {
        this.add(evt.feature);
    },

    /**
     * Handler for #layer 'removefeature' event.
     *
     * @param {Object} evt The event object of OpenLayers.
     * @private
     */
    onFeaturesRemoved: function(evt) {
        var me = this;
        if (!me._removing) {
            var record = me.getByFeature(evt.feature);
            if (record) {
                me._removing = true;
                me.remove(record);
                delete me._removing;
            }
        }
    },

    /**
     * Handles the 'filterchange'-event.
     * Applies the filter of this store to the underlying layer.
     * @private
     */
    onFilterChange: function() {
        var me = this;
        if (me.layer && me.layer.getSource() instanceof ol.source.Vector) {
            if (!me._filtering) {

                me._filtering = true;

                me.unbindLayerEvents();

                // collect the filtered features in the store
                var filteredFeatures = [];
                me.each(function(rec) {
                    filteredFeatures.push(rec.getFeature());
                });

                // apply the filtered to the underlying layer / collection
                me.layer.getSource().clear();
                me.layer.getSource().addFeatures(filteredFeatures);
                me.olCollection = new ol.Collection(filteredFeatures);

                me.bindLayerEvents();

                delete me._filtering;
            }
        }
    }

});
