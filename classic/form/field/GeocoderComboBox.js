/* Copyright (c) 2015-2019 The Open Source Geospatial Foundation
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
 * CAUTION: This class is only usable in applications using the classic toolkit
 *          of ExtJS 6.
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
    config: {
        /**
         * The OpenLayers map to work on. If not provided the selection of an
         * address has no effect.
         *
         * @cfg {ol.Map}
         */
        map: null,
    },
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
     * set on creation.
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
     * @propery {Ext.data.JsonStore}
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
     * The field in the GeoCoder service response to be used as mapping for the
     * 'name' field in the #store.
     * Ignored when a store is passed in.
     *
     * @cfg {String}
     */
    displayValueMapping: 'display_name',

    /**
     * Field from selected record to use when the combo's
     * #getValue method is called. Default is "extent". This field is
     * should contain an ol.Extent.
     * By setting this to 'coordinate' a field containing an ol.Coordinate is used.
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
    emptyText: 'Search a location',

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
     * Flag to set if feature for the selected address is drawn on #map
     * (by #locationLayer).
     *
     * @cfg {Boolean}
     */
    showLocationOnMap: true,

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
                me.setMap(me.map);
            }
        }

        me.callParent(arguments);

        me.on({
            select: this.onSelect,
            focus: me.onFocus,
            scope: me
        });
    },

    setMap: function(map) {
        var me = this;
        if (map) {
            me.map = map;
            if (me.locationLayer) {
                me.map.addLayer(me.locationLayer);
            }
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
