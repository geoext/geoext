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
  * A row selection model which enables automatic selection of features
  * in the map when rows are selected in the grid and vice-versa.
  *
  * **CAUTION: This class is only usable in applications using the classic
  * toolkit of ExtJS 6.**
  *
  * @class GeoExt.selection.FeatureModel
  */
Ext.define('GeoExt.selection.FeatureModel', {
    extend: 'Ext.selection.RowModel',
    alias: 'selection.featuremodel',

    config: {
        /**
         * The connected vector layer.
         * @cfg {ol.layer.Vector}
         * @property {ol.layer.Vector}
         */
        layer: null,

        /**
         * The OpenLayers map we work with
         * @cfg {ol.Map}
         */
        map: null,

        /**
         * Set to true to create a click handler on the map selecting a clicked
         * object in the #layer.
         * @cfg {Boolean}
         */
        mapSelection: false,

        /**
         * The default style for the selected features.
         * @cfg {ol.style.Style}
         */
        selectStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.8)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'darkblue',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.8)'
            }),
            stroke: new ol.style.Stroke({
                color: 'darkblue',
                width: 2
            })
        })
    },

    /**
     * Lookup to preserve existing feature styles. Used to restore feature style
     * when select style is removed.
     * @private
     * @property {Object}
     */
    existingFeatStyles: {},

    /**
     * Indicates if a map click handler has been registered on init.
     * @private
     * @property {Boolean}
     */
    mapClickRegistered: false,

    /**
     * The attribute key to mark an OL feature as selected.
     * @cfg {String}
     * @property
     * @readonly
     */
    selectedFeatureAttr: 'gx_selected',

    /**
     * The currently selected features (`ol.Collection` containing `ol.Feature`
     * instances).
     * @property {ol.Collection}
     */
    selectedFeatures: null,

    /**
     * Prepare several connected objects once the selection model is ready.
     *
     * @private
     */
    bindComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.selectedFeatures = new ol.Collection();

        // detect a layer from the store if not passed in
        if (!me.layer || !me.layer instanceof ol.layer.Vector) {
            var store = me.getStore();
            if (store && store.getLayer && store.getLayer() &&
                store.getLayer() instanceof ol.layer.Vector) {
                me.layer = store.getLayer();
            }
        }

        if (!me._destroying) {
            // bind several OL events since this is not called while destroying
            me.bindOlEvents();
        }
    },

    /**
     * Binds several events on the OL objects used in this class.
     *
     * @private
     */
    bindOlEvents: function() {
        var me = this;

        // change style of selected feature
        me.selectedFeatures.on('add', me.onSelectFeatAdd, me);

        // reset style of no more selected feature
        me.selectedFeatures.on('remove', me.onSelectFeatRemove, me);

        // create a map click listener for connected vector layer
        if (me.mapSelection && me.layer && me.map) {
            me.map.on('singleclick', me.onFeatureClick, me);
            me.mapClickRegistered = true;
        }
    },

    /**
     * Unbinds several events that were registered on the OL objects in this
     * class (see #bindOlEvents).
     *
     * @private
     */
    unbindOlEvents: function() {
        var me = this;

        // remove 'add' / 'remove' listener from selected feature collection
        if (me.selectedFeatures) {
            me.selectedFeatures.un('add', me.onSelectFeatAdd, me);
            me.selectedFeatures.un('remove', me.onSelectFeatRemove, me);
        }

        // remove 'singleclick' listener for connected vector layer
        if (me.mapClickRegistered) {
            me.map.un('singleclick', me.onFeatureClick, me);
            me.mapClickRegistered = false;
        }
    },

    /**
     * Handles 'add' event of #selectedFeatures.
     * Ensures that added feature gets the #selectStyle and preserves an
     * possibly existing feature style.
     *
     * @private
     * @param  {ol.Collection.Event} evt OL event object
     */
    onSelectFeatAdd: function(evt) {
        var me = this;
        var feat = evt.element;
        if (feat) {
            if (feat.getStyle()) {
                // we have to preserve the existing feature style
                var fid = feat.getId() || me.getRandomFid();
                me.existingFeatStyles[fid] = feat.getStyle();
                feat.setId(fid);
            }
            // apply select style
            feat.setStyle(me.selectStyle);
        }
    },

    /**
     * Handles 'remove' event of #selectedFeatures.
     * Ensures that the #selectStyle is reset on the removed feature.
     *
     * @private
     * @param  {ol.Collection.Event} evt OL event object
     */
    onSelectFeatRemove: function(evt) {
        var me = this;
        var feat = evt.element;
        if (feat) {
            var fid = feat.getId();
            if (fid && me.existingFeatStyles[fid]) {
                // restore existing feature style
                feat.setStyle(me.existingFeatStyles[fid]);
                delete me.existingFeatStyles[fid];
            } else {
                // reset feature style, so layer style gets active
                feat.setStyle();
            }
        }
    },

    /**
     * Handles the 'singleclick' event of the #map.
     * Detects if a feature of the connected #layer has been clicked and selects
     * this feature by selecting its corresponding grid row.
     *
     * @private
     * @param  {ol.MapBrowserEvent} evt OL event object
     */
    onFeatureClick: function(evt) {
        var me = this;
        var feat = me.map.forEachFeatureAtPixel(evt.pixel,
            function(feature) {
                return feature;
            }, {
                layerFilter: function(layer) {
                    return layer === me.layer;
                }
            });

        if (feat) {
            // select clicked feature in grid
            me.selectMapFeature(feat);
        }
    },

    /**
     * Selects / deselects a feature by triggering the corresponding actions in
     * the grid (e.g. selecting / deselecting a grid row).
     *
     * @private
     * @param  {ol.Feature} feature The feature to select
     */
    selectMapFeature: function(feature) {
        var me = this;
        var row = me.store.findBy(function(record, id) {
            return record.getFeature() == feature;
        });

        // deselect all if only one can be selected at a time
        if (me.getSelectionMode() === 'SINGLE') {
            me.deselectAll();
        }

        if (feature.get(me.selectedFeatureAttr)) {
            // deselect feature by deselecting grid row
            me.deselect(row);
        } else {
            // select the feature by selecting grid row
            if (row != -1 && !me.isSelected(row)) {
                me.select(row, !this.singleSelect);
                // focus the row in the grid to ensure it is visible
                me.view.focusRow(row);
            }
        }
    },

    /**
     * Overwrites the onSelectChange function of the father class.
     * Ensures that the selected feature is added / removed to / from
     * #selectedFeatures lookup object.
     *
     * @private
     * @param  {GeoExt.data.model.Feature} record Selected / deselected record
     * @param  {Boolean} isSelected Record is selected or deselected
     */
    onSelectChange: function(record, isSelected) {
        var me = this;
        var selFeature = record.getFeature();

        // toggle feature's selection state
        selFeature.set(me.selectedFeatureAttr, isSelected);

        if (isSelected) {
            me.selectedFeatures.push(selFeature);
        } else {
            me.selectedFeatures.remove(selFeature);
        }

        me.callParent(arguments);
    },

    /**
     * Overwrites parent's destroy method in order to unregister the OL events,
     * that were added on init.
     * Needed due to the lack of destroy event of the parent class.
     *
     * @private
     */
    destroy: function() {
        var me = this;

        // unfortunately callParent triggers the bindComponent method, so we
        // have to know if we are in the process of destroying or not.
        me._destroying = true;

        me.unbindOlEvents();
        me.callParent(arguments);

        me._destroying = false;
    },

    /**
     * Returns a random feature ID.
     *
     * @private
     * @return {String} Random feature ID
     */
    getRandomFid: function() {
        // current timestamp plus a random int between 0 and 10
        return new Date().getTime() + '' +  Math.floor(Math.random() * 11);
    }
});
