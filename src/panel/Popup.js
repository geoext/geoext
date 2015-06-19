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
 * @class
 */
Ext.define('GeoExt.panel.Popup', {
    requires: [],
    extend: 'Ext.panel.Panel',
    alias: 'widget.gx_popup',

    config: {

        /**
         *
         */
        overlay: null,

        /**
         *
         */
        map: null
    },

    /**
     *
     */
    cls: 'gx-popup',

    /**
     * @private
     */
    constructor: function(config) {
        var me = this;

        // create a div we can reference in
        // order to bind this div to an ol overlay
        /*global document */
        var div = document.createElement('div');
        div.style.height = '20px';
        Ext.getBody().dom.appendChild(div);
        config.renderTo = div;
        me.divRef = div;

        me.callParent(arguments);
    },

    /**
     * @private
     */
    initComponent: function() {
        var me = this;

        me.on('afterrender', function() {
            // bin our containing div to the ol overlay
            me.getOverlay().set('element', me.divRef);
        });

        me.callParent();

        var ovl = new ol.Overlay({
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });

        me.getMap().addOverlay(ovl);
        // fix layout of popup when its position changes
        ovl.on('change:position', function() {
            me.doLayout();
        });

        // make accessible as member
        me.setOverlay(ovl);
    },

    /**
     * (Re-)Positions the popup to the given coordinates.
     */
    position: function(coordinate) {
        var me = this;
        me.getOverlay().setPosition(coordinate);
    }
});
