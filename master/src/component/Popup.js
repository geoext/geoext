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
 * @class GeoExt.component.Popup
 */
Ext.define('GeoExt.component.Popup', {
    requires: [],
    extend: 'Ext.Component',
    alias: [
        'widget.gx_popup',
        'widget.gx_component_popup'
    ],

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
     * @private
     */
    overlayElement: null,

    /**
     * @private
     */
    overlayElementCreated: false,

    /**
     *
     */
    cls: 'gx-popup',

    /**
     * @private
     */
    constructor: function(config) {
        var me = this,
            cfg = config || {},
            overlayElement;

        if (!Ext.isDefined(cfg.map)) {
            Ext.Error.raise("Required configuration 'map' not passed");
        }
        if (Ext.isDefined(cfg.renderTo)) {
            // use the passed element/string
            overlayElement = Ext.get(cfg.renderTo).dom;
        } else {
            // create a div we can reference in
            // order to bind this div to an ol overlay
            overlayElement = Ext.dom.Helper.append(Ext.getBody(), '<div>');
            // keep track of the fact that we created the element, we should
            // also clean it up once we are being destroyed.
            me.overlayElementCreated = true;
        }
        cfg.renderTo = overlayElement;
        me.overlayElement = overlayElement;
        me.callParent([cfg]);
    },

    /**
     * @private
     */
    initComponent: function() {
        var me = this;
        me.on({
            afterrender: me.setOverlayElement,
            beforedestroy: me.onBeforeDestroy,
            scope: me
        });
        me.callParent();
        me.setupOverlay();
    },

    /**
     * @private
     */
    setupOverlay: function(){
        var me = this;
        var overlay = new ol.Overlay({
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });

        me.getMap().addOverlay(overlay);
        // fix layout of popup when its position changes
        overlay.on('change:position', me.updateLayout, me);

        // make accessible as member
        me.setOverlay(overlay);
    },

    /**
     * @private
     */
    setOverlayElement: function() {
        // bind our containing div to the ol overlay
        this.getOverlay().set('element', this.overlayElement);
    },

    /**
     * (Re-)Positions the popup to the given coordinates.
     */
    position: function(coordinate) {
        var me = this;
        me.getOverlay().setPosition(coordinate);
    },

    /**
     * @private
     */
    onBeforeDestroy: function(){
        var me = this;
        if (me.overlayElementCreated && me.overlayElement) {
            var parent = me.overlayElement.parentNode;
            parent.removeChild(me.overlayElement);
        }
        me.getOverlay().un('change:position', me.doLayout, me);
    }
});
