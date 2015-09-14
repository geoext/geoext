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
 * Create a component container for a map.
 *
 * Example:
 *
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         width: 800,
 *         height: 600,
 *         map: new ol.Map({
 *             layers: [layer],
 *             view: new ol.View({
 *                 center: [0, 0],
 *                 zoom: 2
 *             })
 *         }),
 *         renderTo: 'mapDiv' // ID of the target <div>. Optional.
 *     });
 *
 * @class GeoExt.component.Map
 */
Ext.define("GeoExt.component.Map", {
    extend: "Ext.Component",
    alias: [
        "widget.gx_map",
        "widget.gx_component_map"
    ],
    requires: [
        'GeoExt.data.store.Layers'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.layer.Base',
        'ol.Map',
        'ol.Map#addLayer',
        'ol.Map#getLayers',
        'ol.Map#getSize',
        'ol.Map#getView',
        'ol.Map#removeLayer',
        'ol.Map#setTarget',
        'ol.Map#setView',
        'ol.Map#updateSize',
        'ol.View',
        'ol.View#calculateExtent',
        'ol.View#fit',
        'ol.View#getCenter',
        'ol.View#setCenter'
    ],
    // </debug>

    /**
     * @event pointerrest
     *
     * Fires if the user has left the pointer for an amount
     * of #pointerRestInterval milliseconds at the *same location*. Use the
     * configuration #pointerRestPixelTolerance to configure how long a pixel is
     * considered to be on the *same location*.
     *
     * Please note that this event will only fire if the map has #pointerRest
     * configured with `true`.
     *
     * @param {ol.MapBrowserEvent} olEvt The original and most recent
     *     MapBrowserEvent event.
     * @param {ol.Pixel} lastPixel The originally captured pixel, which defined
     *     the center of the tolerance bounds (itself configurable with the the
     *     configuration #pointerRestPixelTolerance). If this is null, a
     *     completely *new* pointerrest event just happened.
     *
     */

    /**
     * @event pointerrestout
     *
     * Fires if the user first was resting his pointer on the map element, but
     * then moved the pointer out of the map completely.
     *
     * Please note that this event will only fire if the map has #pointerRest
     * configured with `true`.
     *
     * @param {ol.MapBrowserEvent} olEvt The MapBrowserEvent event.
     */

    config: {
        /**
         * A configured map or a configuration object for the map constructor.
         *
         * @cfg {ol.Map} map
         */
        map: null,

        /**
         * A boolean flag to control whether the map component will fire the
         * events #pointerrest and #pointerrestout. If this is set to `false`
         * (the default), no such events will be fired.
         *
         * @cfg {Boolean} pointerRest Whether the component shall provide the
         *     `pointerrest` and `pointerrestout` events.
         */
        pointerRest: false,

        /**
         * The amount of milliseconds after which we will consider a rested
         * pointer as `pointerrest`. Only relevant if #pointerRest is `true`.
         *
         * @cfg {Number} pointerRestInterval The interval in milliseconds.
         */
        pointerRestInterval: 1000,

        /**
         * The amount of pixels that a pointer may move in both vertical and
         * horizontal direction, and still be considered to be a #pointerrest.
         * Only relevant if #pointerRest is `true`.
         *
         * @cfg {Number} pointerRestPixelTolerance The tolerance in pixels.
         */
        pointerRestPixelTolerance: 3
    },

    /**
     * Whether we already rendered an ol.Map in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,

    /**
     * @property {GeoExt.data.store.Layers} layerStore
     * @private
     */
    layerStore: null,

    /**
     * The location of the last mousemove which we track to be able to fire
     * the #pointerrest event. Only usable if #pointerRest is `true`.
     *
     * @property {ol.Pixel} lastPointerPixel
     * @private
     */
    lastPointerPixel: null,

    /**
     * Whether the pointer is currently over the map component. Only usable if
     * the configuration #pointerRest is `true`.
     *
     * @property {Boolean} isMouseOverMapEl
     * @private
     */
    isMouseOverMapEl: null,

    /**
     * @inheritdoc
     */
    constructor: function(config) {
        var me = this;

        me.callParent([config]);

        if(!(me.getMap() instanceof ol.Map)){
            var olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
            me.setMap(olMap);
        }

        me.layerStore = Ext.create('GeoExt.data.store.Layers', {
            storeId: me.getId() + "-store",
            map: me.getMap()
        });

        me.on('resize', me.onResize, me);
    },

    /**
     * (Re-)render the map when size changes.
     */
    onResize: function(){
        // Get the corresponding view of the controller (the mapComponent).
        var me = this;
        if(!me.mapRendered){
            var el = me.getTargetEl ? me.getTargetEl() : me.element;
            me.getMap().setTarget(el.dom);
            me.mapRendered = true;
        } else {
            me.getMap().updateSize();
        }
    },

    /**
     * Will contain a buffered version of #unbufferedPointerMove, but only if
     * the configuration #pointerRest is true.
     *
     * @private
     */
    bufferedPointerMove: Ext.emptyFn,

    /**
     * Bound as a eventlistener for pointermove on the OpenLayers map, but only
     * if the configuration #pointerRest is true. Will eventually fire the
     * special events #pointerrest or #pointerrestout.
     *
     * @param {ol.MapBrowserEvent} olEvt The MapBrowserEvent event.
     * @private
     */
    unbufferedPointerMove: function(olEvt){
        var me = this;
        var tolerance = me.getPointerRestPixelTolerance();
        var pixel = olEvt.pixel;

        if (!me.isMouseOverMapEl) {
            me.fireEvent('pointerrestout', olEvt);
            return;
        }

        if (me.lastPointerPixel) {
            var deltaX = Math.abs(me.lastPointerPixel[0] - pixel[0]);
            var deltaY = Math.abs(me.lastPointerPixel[1] - pixel[1]);
            if (deltaX > tolerance || deltaY > tolerance) {
                me.lastPointerPixel = pixel;
            } else {
                // fire pointerrest, and include the original pointer pixel
                me.fireEvent('pointerrest', olEvt, me.lastPointerPixel);
                return;
            }
        } else {
            me.lastPointerPixel = pixel;
        }
        // a new pointerrest event, the second argument (the 'original' pointer
        // pixel) must be null, as we start from a totally new position
        me.fireEvent('pointerrest', olEvt, null);
    },

    /**
     * Creates #bufferedPointerMove from #unbufferedPointerMove and binds it
     * to `pointermove` on the OpenLayers map.
     *
     * @private
     */
    registerPointerRestEvents: function(){
        var me = this;
        var map = me.getMap();

        if (me.bufferedPointerMove === Ext.emptyFn) {
            me.bufferedPointerMove = Ext.Function.createBuffered(
                me.unbufferedPointerMove,
                me.getPointerRestInterval(),
                me
            );
        }

        // Check if we have to fire any pointer* events
        map.on('pointermove', me.bufferedPointerMove);

        if (!me.rendered) {
            // make sure we do not fire any if the pointer left the component
            me.on('afterrender', me.bindEnterLeaveListeners, me);
        } else {
            me.bindEnterLeaveListeners();
        }

    },

    /**
     * Registers listeners that'll take care of setting #isMouseOverMapEl to
     * correct values.
     *
     * @private
     */
    bindEnterLeaveListeners: function() {
        var me = this;
        var mapEl = me.getEl();
        if (mapEl) {
            mapEl.on({
                mouseenter: me.onMouseEnter,
                mouseleave: me.onMouseLeave,
                scope: me
            });
        }
    },

    /**
     * Unregisters listeners that'll take care of setting #isMouseOverMapEl to
     * correct values.
     *
     * @private
     */
    unbindEnterLeaveListeners: function() {
        var me = this;
        var mapEl = me.getTargetEl ? me.getTargetEl() : me.element;
        if (mapEl) {
            mapEl.un({
                mouseenter: me.onMouseEnter,
                mouseleave: me.onMouseLeave,
                scope: me
            });
        }
    },

    /**
     * Sets isMouseOverMapEl to true, see #pointerRest.
     *
     * @private
     */
    onMouseEnter: function() {
        this.isMouseOverMapEl = true;
    },

    /**
     * Sets isMouseOverMapEl to false, see #pointerRest.
     *
     * @private
     */
    onMouseLeave: function() {
        this.isMouseOverMapEl = false;
    },

    /**
     * Unregisters the #bufferedPointerMove event listener and unbinds the
     * enter- and leave-listeners.
     */
    unregisterPointerRestEvents: function(){
        var map = this.getMap();
        this.unbindEnterLeaveListeners();
        if (map) {
            map.un('pointermove', this.bufferedPointerMove);
        }
    },

    /**
     * Whenever the value of #pointerRest is changed, this method will take
     * care of registering or unregistering internal event listeners.
     *
     * @param {Boolean} val The new value that someone set for `pointerRest`.
     * @return {Boolean} The passed new value for  `pointerRest` unchanged.
     */
    applyPointerRest: function(val) {
        if (val) {
            this.registerPointerRestEvents();
        } else {
            this.unregisterPointerRestEvents();
        }
        return val;
    },

    /**
     * Returns the center coordinate of the view.
     *
     * @return {ol.Coordinate}
     */
    getCenter: function(){
        return this.getMap().getView().getCenter();
    },

    /**
     * Set the center of the view.
     *
     * @param {ol.Coordinate} center
     */
    setCenter: function(center){
        this.getMap().getView().setCenter(center);
    },

    /**
     * Returns the extent of the current view.
     *
     * @return {ol.Extent}
     */
    getExtent: function(){
        return this.getView().calculateExtent(this.getMap().getSize());
    },

    /**
     * Set the extent of the view.
     *
     * @param {ol.Extent} extent
     */
    setExtent: function(extent){
        this.getView().fit(extent, this.getMap().getSize());
    },

    /**
     * Returns the layers of the map.
     *
     * @return {ol.Collection} The layer collection.
     */
    getLayers: function(){
        return this.getMap().getLayers();
    },

    /**
     * Add a layer to the map.
     *
     * @param {ol.layer.Base} layer
     */
    addLayer: function(layer){
        if(layer instanceof ol.layer.Base){
            this.getMap().addLayer(layer);
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' cause it is not ' +
                'an instance of ol.layer.Base');
        }
    },

    /**
     * Add a layer to the map.
     *
     * @param {ol.layer.Base} layer
     */
    removeLayer: function(layer){
        if(layer instanceof ol.layer.Base){
            if(Ext.Array.contains(this.getLayers().getArray(), layer)){
                this.getMap().removeLayer(layer);
            }
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' cause it is not ' +
                'an instance of ol.layer.Base');
        }
    },

    /**
     * Returns the GeoExt.data.store.Layers
     *
     * @return {GeoExt.data.store.Layers}
     */
    getStore: function(){
        return this.layerStore;
    },

    /**
     * Returns the view of the map.
     *
     * @return {ol.View}
     */
    getView: function(){
        return this.getMap().getView();
    },

    /**
     * Set the view of the map.
     *
     * @param {ol.View} view
     */
    setView: function(view){
        this.getMap().setView(view);
    }
});
