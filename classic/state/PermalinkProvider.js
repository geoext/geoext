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
 * The permalink provider.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * Sample code displaying a new permalink each time the map is moved:
 *
 *     @example preview
 *     // create permalink provider
 *     var permalinkProvider = Ext.create('GeoExt.state.PermalinkProvider', {});
 *     // set it in the state manager
 *     Ext.state.Manager.setProvider(permalinkProvider);
 *
 *     // create a map panel, and make it stateful
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         stateful: true,
 *         stateId: 'gx_mapstate',
 *         map: new ol.Map({
 *             layers: [
 *                 new ol.layer.Tile({
 *                     source: new ol.source.OSM()
 *                 })
 *             ],
 *             view: new ol.View({
 *                 center: ol.proj.fromLonLat([-8.751278, 40.611368]),
 *                 zoom: 12
 *             })
 *         })
 *     });
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'GeoExt.component.Map Example',
 *         height: 200,
 *         items: [mapComponent],
 *         renderTo: Ext.getBody()
 *     });
 *     // display permalink hash each time state is changed
 *     permalinkProvider.on({
 *         statechange: function(provider, name, value) {
 *             alert(provider.getPermalinkHash());
 *         }
 *     });
 *
 * @class GeoExt.state.PermalinkProvider
 */
Ext.define('GeoExt.state.PermalinkProvider', {
    extend: 'Ext.state.Provider',
    requires: [],

    alias: 'state.gx_permalinkprovider',

    /**
     * Current map state object.
     *
     * @property {Object}
     * @private
     */
    mapState: null,

    constructor: function() {
        var me = this;

        me.callParent(arguments);

        if (window.location.hash !== '') {
            me.mapState = me.readPermalinkHash(window.location.hash);
        }
    },

    /**
     * Create a state object from a URL hash.
     * The hash to be in the form `#map=12/-1035528.44/7073659.19/0`
     *
     * @param {String} plHash The URL hash to get the state from
     * @return {Object} The state object
     * @private
     */
    readPermalinkHash: function(plHash) {
        var mapState;
        // try to restore center, zoom-level and rotation from the URL
        var hash = plHash.replace('#map=', '');
        var parts = hash.split('/');

        if (parts.length === 4) {
            mapState = {
                zoom: parseInt(parts[0], 10),
                center: [
                    parseFloat(parts[1]),
                    parseFloat(parts[2])
                ],
                rotation: parseFloat(parts[3])
            };
        }

        return mapState;
    },

    /**
     * Returns the URL hash part with current zoom-level, center and rotation
     * corresponding to the current state.
     *
     * @param {Boolean} doRound Flag if coords should be rounded to 2
     *     digits or not
     * @return {String} The hash part of the permalink
     */
    getPermalinkHash: function(doRound) {
        var me = this;
        var mapState = me.mapState;

        var centerX = mapState.center[0];
        var centerY = mapState.center[1];
        if (doRound) {
            centerX = Math.round(centerX * 100) / 100;
            centerY = Math.round(centerY * 100) / 100;
        }

        var hash = '#map=' +
            mapState.zoom + '/' +
            centerX + '/' +
            centerY + '/' +
            mapState.rotation;

        return hash;
    },

    /**
     * Sets the value for a key.
     *
     * @param {String} name The key name
     * @param {Object} value The value to set
     */
    set: function(name, value) {
        var me = this;
        // keep our mapState object in sync with the state
        me.mapState = value;
        // call 'set' of super class
        me.callParent(arguments);
    }
});
