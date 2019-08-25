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
 * A component that renders an `ol.Map` and that can be used in any ExtJS
 * layout.
 *
 * An example: A map component rendered inside of a panel:
 *
 *     @example preview
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
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
 *
 * @class GeoExt.component.Map
 */
Ext.define('GeoExt.component.Map', {
    extend: 'Ext.Component',
    alias: [
        'widget.gx_map',
        'widget.gx_component_map'
    ],
    requires: [
        'GeoExt.data.store.Layers',
        'GeoExt.util.Version'
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

    /**
     * @event aftermapmove
     *
     * Triggered when the 'moveend' event of the underlying OpenLayers map is
     * fired.
     *
     * @param {GeoExt.component.Map} this
     * @param {ol.Map} olMap The OpenLayers map firing the original 'moveend'
     *     event
     * @param {ol.MapEvent} olEvt The original OpenLayers event
     */

    stateEvents: [
        'aftermapmove'
    ],

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

        if (!(me.getMap() instanceof ol.Map)) {
            var olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
            me.setMap(olMap);
        }

        me.layerStore = Ext.create('GeoExt.data.store.Layers', {
            storeId: me.getId() + '-store',
            map: me.getMap()
        });

        me.bindStateOlEvents();

        me.on('resize', me.onResize, me);
    },

    /**
     * (Re-)render the map when size changes.
     */
    onResize: function() {
        // Get the corresponding view of the controller (the mapComponent).
        var me = this;
        if (!me.mapRendered) {
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
    unbufferedPointerMove: function(olEvt) {
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
    registerPointerRestEvents: function() {
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
            me.on('afterrender', me.bindOverOutListeners, me);
        } else {
            me.bindOverOutListeners();
        }

    },

    /**
     * Registers listeners that'll take care of setting #isMouseOverMapEl to
     * correct values.
     *
     * @private
     */
    bindOverOutListeners: function() {
        var me = this;
        var mapEl = me.getTargetEl ? me.getTargetEl() : me.element;
        if (mapEl) {
            mapEl.on({
                mouseover: me.onMouseOver,
                mouseout: me.onMouseOut,
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
    unbindOverOutListeners: function() {
        var me = this;
        var mapEl = me.getTargetEl ? me.getTargetEl() : me.element;
        if (mapEl) {
            mapEl.un({
                mouseover: me.onMouseOver,
                mouseout: me.onMouseOut,
                scope: me
            });
        }
    },

    /**
     * Sets isMouseOverMapEl to true, see #pointerRest.
     *
     * @private
     */
    onMouseOver: function() {
        this.isMouseOverMapEl = true;
    },

    /**
     * Sets isMouseOverMapEl to false, see #pointerRest.
     *
     * @private
     */
    onMouseOut: function() {
        this.isMouseOverMapEl = false;
    },

    /**
     * Unregisters the #bufferedPointerMove event listener and unbinds the
     * over- and out-listeners.
     */
    unregisterPointerRestEvents: function() {
        var me = this;
        var map = me.getMap();
        me.unbindOverOutListeners();
        if (map) {
            map.un('pointermove', me.bufferedPointerMove);
        }
        me.bufferedPointerMove = Ext.emptyFn;
    },

    /**
     * Whenever the value of #pointerRest is changed, this method will take
     * care of registering or unregistering internal event listeners.
     *
     * @param {Boolean} val The new value that someone set for `pointerRest`.
     * @return {Boolean} The passed new value for `pointerRest` unchanged.
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
     * Whenever the value of #pointerRestInterval is changed, this method will
     * take to reinitialize the #bufferedPointerMove method and handlers to
     * actually trigger the event.
     *
     * @param {Boolean} val The new value that someone set for
     *     `pointerRestInterval`.
     * @return {Boolean} The passed new value for `pointerRestInterval`
     *     unchanged.
     */
    applyPointerRestInterval: function(val) {
        var me = this;
        var isEnabled = me.getPointerRest();
        if (isEnabled) {
            // Toggle to rebuild the buffered pointer move.
            me.setPointerRest(false);
            me.setPointerRest(isEnabled);
        }
        return val;
    },

    /**
     * Returns the center coordinate of the view.
     *
     * @return {ol.Coordinate} The center of the map view as `ol.Coordinate`.
     */
    getCenter: function() {
        return this.getMap().getView().getCenter();
    },

    /**
     * Set the center of the view.
     *
     * @param {ol.Coordinate} center The new center as `ol.Coordinate`.
     */
    setCenter: function(center) {
        this.getMap().getView().setCenter(center);
    },

    /**
     * Returns the extent of the current view.
     *
     * @return {ol.Extent} The extent of the map view as `ol.Extent`.
     */
    getExtent: function() {
        return this.getView().calculateExtent(this.getMap().getSize());
    },

    /**
     * Set the extent of the view.
     *
     * @param {ol.Extent} extent The extent as `ol.Extent`.
     */
    setExtent: function(extent) {
        // Check for backwards compatibility
        if (GeoExt.util.Version.isOl3()) {
            this.getView().fit(extent, this.getMap().getSize());
        } else {
            this.getView().fit(extent);
        }
    },

    /**
     * Returns the layers of the map.
     *
     * @return {ol.Collection} The layer collection.
     */
    getLayers: function() {
        return this.getMap().getLayers();
    },

    /**
     * Add a layer to the map.
     *
     * @param {ol.layer.Base} layer The layer to add.
     */
    addLayer: function(layer) {
        if (layer instanceof ol.layer.Base) {
            this.getMap().addLayer(layer);
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' as it is not ' +
                'an instance of ol.layer.Base');
        }
    },

    /**
     * Remove a layer from the map.
     *
     * @param {ol.layer.Base} layer The layer to remove.
     */
    removeLayer: function(layer) {
        if (layer instanceof ol.layer.Base) {
            if (Ext.Array.contains(this.getLayers().getArray(), layer)) {
                this.getMap().removeLayer(layer);
            }
        } else {
            Ext.Error.raise('Can not remove layer ' + layer + ' as it is not ' +
                'an instance of ol.layer.Base');
        }
    },

    /**
     * Returns the `GeoExt.data.store.Layers`.
     *
     * @return {GeoExt.data.store.Layers} The layer store.
     */
    getStore: function() {
        return this.layerStore;
    },

    /**
     * Returns the view of the map.
     *
     * @return {ol.View} The `ol.View` of the map.
     */
    getView: function() {
        return this.getMap().getView();
    },

    /**
     * Set the view of the map.
     *
     * @param {ol.View} view The `ol.View` to use for the map.
     */
    setView: function(view) {
        this.getMap().setView(view);
    },

    /**
     * Forwards the OpenLayers events so they become usable in the #statedEvents
     * array and a possible `GeoExt.state.PermalinkProvider` can change the
     * state when one of the events gets fired.
     */
    bindStateOlEvents: function() {
        var me = this;
        var olMap = me.getMap();
        olMap.on('moveend', function(evt) {
            me.fireEvent('aftermapmove', me, olMap, evt);
        });
    },

    /**
     * Returns the state of the map as keyed object. The following keys will be
     * available:
     *
     * * `center`
     * * `zoom`
     * * `rotation`
     *
     * @return {Object} The state object
     * @private
     */
    getState: function() {
        var me = this;
        var view = me.getMap().getView();
        return {
            zoom: view.getZoom(),
            center: view.getCenter(),
            rotation: view.getRotation()
        };
    },

    /**
     * Apply the provided map state object. The following keys are interpreted:
     *
     * * `center`
     * * `zoom`
     * * `rotation`
     *
     * @param  {Object} mapState The state object
     */
    applyState: function(mapState) {
        // exit if no map state is provided
        if (!Ext.isObject(mapState)) {
            return;
        }

        var me = this;
        var view = me.getMap().getView();

        view.setCenter(mapState.center);
        view.setZoom(mapState.zoom);
        view.setRotation(mapState.rotation);
    }
});
