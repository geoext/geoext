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

        var ovl = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        }));

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
