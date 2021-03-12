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
 * Creates a combo box that handles results from a geocoding service. By
 * default it uses OSM Nominatim, but the component offers all config options
 * to overwrite in order to other custom services.
 * If the user enters a valid address in the search box, the combo's store will
 * be populated with records that match the
 * address. By default, records have the following fields:
 *
 *   * name   - `String` The formatted address.
 *   * extent - `ol.Extent` The extent of the matching address
 *   * bounds - `ol.Coordinate` The point coordinate of the matching address
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.form.field.GeocoderComboBox
 */
Ext.define('GeoExt.form.field.GeocoderComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: [
        'widget.gx_geocoder_combo',
        'widget.gx_geocoder_combobox',
        'widget.gx_geocoder_field'
    ],
    requires: [
        'Ext.data.JsonStore'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    /**
     * The OpenLayers map to work on. If not provided the selection of an
     * address would have no effect.
     *
     * @cfg {ol.Map}
     */
    map: null,

    /**
     * Vector layer to visualize the selected address.
     * Will be created if not provided.
     *
     * @cfg {ol.layer.Vector}
     * @property {ol.layer.Vector}
     */
    locationLayer: null,

    /**
     * The style of the #locationLayer. Only has an effect if the layer is not
     * passed in while creation.
     *
     * @cfg {ol.style.Style}
     */
    locationLayerStyle: null,

    /**
     * The store used for this combo box. Default is a
     * store with  the url configured as #url
     * config.
     *
     * @cfg {Ext.data.JsonStore}
     * @property {Ext.data.JsonStore}
     */
    store: null,

    /**
     * The property in the JSON response of the geocoding service used in
     * the store's proxy as root object.
     *
     * @cfg {String}
     */
    proxyRootProperty: null,

    /**
     * The field to display in the combobox result. Default is
     * "name" for instant use with the default store for this component.
     *
     * @cfg {String}
     */
    displayField: 'name',

    /**
     * The field in the GeoCoder service repsonse to be used as mapping for the
     * 'name' field in the #store.
     * Ignored when a store is passed in.
     *
     * @cfg {String}
     */
    displayValueMapping: 'display_name',

    /**
     * Field from selected record to use when the combo's
     * #getValue method is called. Default is "extent". This field is
     * supposed to contain an ol.Extent.
     * By setting this to 'coordinate' a field holding an ol.Coordinate is used.
     *
     * @cfg {String}
     */
    valueField: 'extent',

    /**
     * The query parameter for the user entered search text.
     * Default is 'q' for instant use with OSM Nominatim.
     *
     * @cfg {String}
     */
    queryParam: 'q',

    /**'Search'
     * Text to display for an empty field.
     *
     * @cfg {String}
     */
    emptyText: 'Search for a location',

    /**
     * Minimum number of entered characters to trigger a search.
     *
     * @cfg {Number}
     */
    minChars: 3,

    /**
     * Delay before the search occurs in ms.
     *
     * @cfg {Number}
     */
    queryDelay: 100,

    /**
     * URL template for querying the geocoding service. If a store is
     * configured, this will be ignored. Note that the #queryParam will be used
     * to append the user's combo box input to the url.
     *
     * @cfg {String}
     */
    url: 'https://nominatim.openstreetmap.org/search?format=json',

    /**
     * The SRS used by the geocoder service.
     *
     * @cfg {String}
     */
    srs: 'EPSG:4326',

    /**
     * Zoom level when zooming to a location (#valueField='coordinate')
     * Not used when zooming to extent.
     *
     * @cfg {Number}
     */
    zoom: 10,

    /**
     * Flag to steer if selected address feature is drawn on #map
     * (by #locationLayer).
     *
     * @cfg {Boolean}
     */
    showLocationOnMap: true,

    /**
     * Flag to restrict nomination query to current map extent
     *
     * @cfg {Boolean}
     */
    restrictToMapExtent: false,

    /**
     * @private
     */
    initComponent: function() {
        var me = this;

        if (!me.store) {
            me.store = Ext.create('Ext.data.JsonStore', {
                fields: [
                    {name: 'name', mapping: me.displayValueMapping},
                    {name: 'extent', convert: me.convertToExtent},
                    {name: 'coordinate', convert: me.convertToCoordinate}
                ],
                proxy: {
                    type: 'ajax',
                    url: me.url,
                    reader: {
                        type: 'json',
                        rootProperty: me.proxyRootProperty
                    }
                }
            });
        }

        if (!me.locationLayer) {
            me.locationLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: me.locationLayerStyle !== null ?
                    me.locationLayerStyle : undefined
            });

            if (me.map) {
                me.map.addLayer(me.locationLayer);
            }
        }

        me.callParent(arguments);

        me.on({
            unRestrictMapExtent: me.unRestrictExtent,
            restrictToMapExtent: me.restrictExtent,
            select: me.onSelect,
            focus: me.onFocus,
            scope: me
        });

        if (me.restrictToMapExtent) {
            me.restrictExtent();
        }
    },

    /**
     * Handle restriction to viewbox: register moveend event
     * and update params of AJAX proxy
     */
    restrictExtent: function() {
        var me = this;
        me.map.on('moveend', me.updateExtraParams, me);
        me.updateExtraParams();
    },

    /**
     * Update viewbox parameter based on the current map extent
     */
    updateExtraParams: function() {
        var me = this;
        var mapSize = me.map.getSize();
        var mv = me.map.getView();
        var extent = mv.calculateExtent(mapSize);
        me.addMapExtentParams(extent, mv.getProjection());
    },

    /**
     * Update map extent params of AJAX proxy.
     *
     * By default, 'viewbox' and 'bounded' are updated since Nominatim is the
     * default geocoder in this class. If no projection is passed the one of
     * the map view is used.
     *
     * @param {ol.Extent} extent The extend to restrict the geocoder to
     * @param {ol.proj.Projection} projection The projection of given extent
     */
    addMapExtentParams: function(extent, projection) {
        var me = this;
        if (!projection) {
            projection = me.map.getView().getProjection();
        }
        var ll = ol.proj.transform([extent[0], extent[1]],
            projection, 'EPSG:4326');
        var ur = ol.proj.transform([extent[2], extent[3]],
            projection, 'EPSG:4326');

        ll = Ext.Array.map(ll, function(val) {
            return Math.min(Math.max(val, -180), 180);
        });
        ur = Ext.Array.map(ur, function(val) {
            return Math.min(Math.max(val, -180), 180);
        });
        var viewBoxStr = [ll.join(','), ur.join(',')].join(',');

        if (me.store && me.store.getProxy()) {
            me.store.getProxy().setExtraParam('viewbox', viewBoxStr);
            me.store.getProxy().setExtraParam('bounded', '1');
        }
    },

    /**
     * Cleanup if extent restriction is omitted.
     * -> moveend event from map
     * -> call removeMapExtentParams to reset params set in store
     */
    unRestrictExtent: function() {
        var me = this;
        // unbinding moveend event
        me.map.un('moveend', me.updateExtraParams, me);
        // cleanup params in store
        me.removeMapExtentParams();
    },

    /**
     * Remove restriction to viewbox, in particular remove viewbox
     * and bounded parameters from AJAX proxy for nominatim queries
     */
    removeMapExtentParams: function() {
        var me = this;
        if (me.store && me.store.getProxy()) {
            me.store.getProxy().setExtraParam('viewbox', undefined);
            me.store.getProxy().setExtraParam('bounded', undefined);
        }
    },

    /**
     * Function to convert the data delivered by the geocoder service to an
     * ol.Extent ([minx, miny, maxx, maxy]).
     * Default implementation converts the Nominatim response.
     * Can be overwritten to work with other services.
     *
     * @param  {Mixed}          v   The data value as read by the Reader
     * @param  {Ext.data.Model} rec The data record containing raw data
     * @return {ol.Extent}          The created ol.Extent
     */
    convertToExtent: function(v, rec) {
        var rawExtent = rec.get('boundingbox');
        var minx = parseFloat(rawExtent[2], 10);
        var miny = parseFloat(rawExtent[0], 10);
        var maxx = parseFloat(rawExtent[3], 10);
        var maxy = parseFloat(rawExtent[1], 10);

        return [minx, miny, maxx, maxy];
    },

    /**
     * Function to convert the data delivered by the geocoder service to an
     * ol.Coordinate ([x, y]).
     * Default implementation converts the Nominatim response.
     * Can be overwritten to work with other services.
     *
     * @param  {Mixed}          v   The data value as read by the Reader
     * @param  {Ext.data.Model} rec The data record containing raw data
     * @return {ol.Coordinate}      The created ol.Coordinate
     */
    convertToCoordinate: function(v, rec) {
        return [parseFloat(rec.get('lon'), 10), parseFloat(rec.get('lat'), 10)];
    },

    /**
     * Draws the selected address feature on the map.
     *
     * @param  {ol.Coordinate | ol.Extent} coordOrExtent Location feature to be
     *   drawn on the map
     */
    drawLocationFeatureOnMap: function(coordOrExtent) {
        var me = this;
        var geom;
        if (coordOrExtent.length === 2) {
            geom = new ol.geom.Point(coordOrExtent);
        } else if (coordOrExtent.length === 4) {
            geom = ol.geom.Polygon.fromExtent(coordOrExtent);
        }

        if (geom) {
            var feat = new ol.Feature({
                geometry: geom
            });
            me.locationLayer.getSource().clear();
            me.locationLayer.getSource().addFeature(feat);
        }
    },

    /**
     * Removes the drawn address feature from the map.
     */
    removeLocationFeature: function() {
        this.locationLayer.getSource().clear();
    },

    /**
     * Handles the 'focus' event of this ComboBox.
     */
    onFocus: function() {
        var me = this;
        me.clearValue();
        me.removeLocationFeature();
    },

    /**
     * Handles the 'select' event of this ComboBox.
     * Zooms to the selected address and draws the address feature on the map
     * (if configured in #showLocationOnMap)
     *
     * @param  {GeoExt.form.field.GeocoderComboBox} combo  [description]
     * @param  {Ext.data.Model} record [description]
     *
     * @private
     */
    onSelect: function(combo, record) {
        var me = this;
        if (!me.map) {
            Ext.Logger.warn('No map configured in ' +
                'GeoExt.form.field.GeocoderComboBox. Skip zoom to selection.');
            return;
        }

        var value = record.get(me.valueField);
        var projValue;
        var olMapView = me.map.getView();
        var targetProj = olMapView.getProjection().getCode();
        if (value.length === 2) {
            // point based value
            projValue = ol.proj.transform(value, me.srs, targetProj);

            // adjust the map
            olMapView.setCenter(projValue);
            olMapView.setZoom(me.zoom);
        } else if (value.length === 4) {
            // bbox based value
            projValue = ol.proj.transformExtent(value, me.srs, targetProj);

            // adjust the map
            olMapView.fit(projValue);
        }

        if (me.showLocationOnMap) {
            me.drawLocationFeatureOnMap(projValue);
        }
    }
});
