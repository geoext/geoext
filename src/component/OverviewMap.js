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
 * An GeoExt.component.OverviewMap displays an overview map of a parent map.
 * You can use this component as any other Ext.Component, e.g give it as an item
 * to a panel.
 *
 * Example:
 *
 *     @example preview
 *     var olMap = new ol.Map({
 *         layers: [
 *             new ol.layer.Tile({
 *                source: new ol.source.OSM()
 *             })
 *         ],
 *         view: new ol.View({
 *             center: ol.proj.fromLonLat([-8.751278, 40.611368]),
 *             zoom: 12,
 *             rotation: -Math.PI / 6
 *         })
 *     });
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: olMap
 *     });
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *        title: 'Map',
 *        region: 'center',
 *        layout: 'fit',
 *        items: mapComponent
 *     });
 *     var overviewMapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'OverviewMap',
 *         region: 'west',
 *         layout: 'fit',
 *         width: 160,
 *         // create the overview by passing the ol.Map:
 *         items: Ext.create('GeoExt.component.OverviewMap', {
 *             parentMap: olMap
 *         })
 *     });
 *     Ext.create('Ext.panel.Panel', {
 *        height: 300,
 *        layout: 'border',
 *        items: [mapPanel, overviewMapPanel],
 *        renderTo: Ext.getBody()
 *     });
 *
 * @class GeoExt.component.OverviewMap
 */
Ext.define('GeoExt.component.OverviewMap', {
    extend: 'Ext.Component',
    alias: [
        'widget.gx_overview',
        'widget.gx_overviewmap',
        'widget.gx_component_overviewmap'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.animation.pan',
        'ol.Collection',
        'ol.Feature',
        'ol.Feature#setGeometry',
        'ol.Feature#setStyle',
        'ol.geom.Point',
        'ol.geom.Point#getCoordinates',
        'ol.geom.Point#setCoordinates',
        'ol.geom.Polygon',
        'ol.geom.Polygon.fromExtent',
        'ol.geom.Polygon#getCoordinates',
        'ol.geom.Polygon#setCoordinates',
        'ol.interaction.Translate',
        'ol.layer.Image', // we should get rid of this requirement
        'ol.layer.Tile', // we should get rid of this requirement
        'ol.layer.Vector',
        'ol.layer.Vector#getSource',
        'ol.Map',
        'ol.Map#addLayer',
        'ol.Map#beforeRender',
        'ol.Map#getView',
        'ol.Map#on',
        'ol.Map#updateSize',
        'ol.Map#un',
        'ol.source.Vector',
        'ol.source.Vector#addFeatures',
        'ol.View',
        'ol.View#calculateExtent',
        'ol.View#getCenter',
        'ol.View#getProjection',
        'ol.View#getRotation',
        'ol.View#getZoom',
        'ol.View#on',
        'ol.View#set',
        'ol.View#setCenter',
        'ol.View#un'
    ],
    // </debug>

    config: {
        /**
         * The style for the anchor feature which indicates the upper-left
         * corner of the overview rectangle.
         *
         * @cfg {ol.style.Style} anchorStyle
         */
        anchorStyle: null,

        /**
         * The style for the overview rectangle.
         *
         * @cfg {ol.style.Style} boxStyle
         */
        boxStyle: null,

        /**
         * An `ol.Collection` of `ol.layer.Base`. If not defined on
         * construction, the layers of the #parentMap will be used.
         *
         * @cfg {ol.Collection}
         */
        layers: [],

        /**
         * The magnification is the relationship in which the resolution of the
         * overviewmaps view is bigger then resolution of the parentMaps view.
         *
         * @cfg {Number} magnification
         */
        magnification: 5,

        /**
         * A configured map or a configuration object for the map constructor.
         *
         * **This is the overviewMap itself.**
         *
         * @cfg {ol.Map/Object} map
         */
        map: null,

        /**
         * A configured map or a configuration object for the map constructor.
         *
         * **This should be the map the overviewMap is bound to.**
         *
         * @cfg {ol.Map} parentMap
         */
        parentMap: null,

        /**
         * Shall a click on the overview map recenter the parent map?
         *
         * @cfg {Boolean} recenterOnClick Whether we shall recenter the parent
         *     map on a click on the overview map or not.
         */
        recenterOnClick: true,

        /**
         * Shall the extent box on the overview map be draggable to recenter the
         * parent map?
         *
         * @cfg {Boolean} enableBoxDrag Whether we shall make the box feature of
         *     the overview map draggable. When dragging ends, the parent map
         *     is recentered.
         */
        enableBoxDrag: true,

        /**
         * Duration time in milliseconds of the panning animation when we
         * recenter the map after a click on the overview or after dragging of
         * the extent box ends. Only has effect if either or both of the
         * configs #recenterOnClick or #enableBoxDrag are `true`.
         *
         * @cfg {Number} recenterDuration Amount of milliseconds for panning
         *     the parent map to the clicked location or the new center of the
         *     box feature.
         */
        recenterDuration: 500
    },

    statics: {
        /**
         * Rotates a coordinate around another center coordinate and returns the
         * new coordinate.
         *
         * @param {Number[]} coord The coordinate to rotate as array with
         *     `[x, y]`.
         * @param {Number[]} center The coordinate to rotate around as array
         *     with `[x, y]`.
         * @param {Number} rotation The rotation in radians.
         * @return {Number[]} The rotate coordinate as array with `[x, y]`.
         */
        rotateCoordAroundCoord: function(coord, center, rotation) {
            var cosTheta = Math.cos(rotation);
            var sinTheta = Math.sin(rotation);

            var x = (cosTheta * (coord[0] - center[0]) - sinTheta *
                    (coord[1] - center[1]) + center[0]);
            var y = (sinTheta * (coord[0] - center[0]) + cosTheta *
                    (coord[1] - center[1]) + center[1]);

            return [x, y];
        },

        /**
         * Rotates a geometry around a center coordinate and returns the
         * new geometry. Only reliably works with instances of `ol.geom.Point`
         * or `ol.geom.Polygon`, the latter loosing any inner rings (holes) it
         * may have.
         *
         * @param {ol.geom.Point|ol.geom.Polygon} geom The geometry to rotate.
         * @param {Number[]} centerCoord The coordinate to rotate around as
         *     array with `[x, y]`.
         * @param {Number} rotation The rotation in radians.
         * @return {Number[]} The rotate coordinate as array with `[x, y]`.
         */
        rotateGeomAroundCoord: function(geom, centerCoord, rotation) {
            var me = this;
            var ar = [];
            var coords;

            if (geom instanceof ol.geom.Point) {
                ar.push(
                    me.rotateCoordAroundCoord(
                        geom.getCoordinates(), centerCoord, rotation
                    )
                );
                geom.setCoordinates(ar[0]);
            } else if (geom instanceof ol.geom.Polygon) {
                coords = geom.getCoordinates()[0];
                coords.forEach(function(coord) {
                    ar.push(
                        me.rotateCoordAroundCoord(
                            coord, centerCoord, rotation
                        )
                    );
                });
                geom.setCoordinates([ar]);
            }
            return geom;
        }
    },

    /**
     * The `ol.Feature` that represents the extent of the parent map.
     *
     * @type {ol.Feature}
     * @private
     */
    boxFeature: null,

    /**
     * The `ol.Feature` that represents the top left corner 0f the parent map.
     *
     * @type {ol.Feature}
     * @private
     */
    anchorFeature: null,

    /**
     * The `ol.layer.Vector` displaying the extent geometry of the parent map.
     *
     * @private
     */
    extentLayer: null,

    /**
     * The `ol.interaction.Translate` that we might have created (depending on
     * the setting of the #enableBoxDrag configuration).
     *
     * @private
     */
    dragInteraction: null,

    /**
     * Whether we already rendered an ol.Map in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,

    /**
     * The constructor of the OverviewMap component.
     */
    constructor: function() {
        this.initOverviewFeatures();
        this.callParent(arguments);
    },

    /**
     * Initializes the GeoExt.component.OverviewMap.
     */
    initComponent: function() {
        var me = this;

        if (!me.getParentMap()) {
            Ext.Error.raise('No parentMap defined for overviewMap');
        } else if (!(me.getParentMap() instanceof ol.Map)) {
            Ext.Error.raise('parentMap is not an instance of ol.Map');
        }

        me.initOverviewMap();

        me.on('beforedestroy', me.onBeforeDestroy, me);
        me.on('resize', me.onResize, me);

        me.callParent();
    },

    /**
     * Creates the ol instances we need: two features for the box and the
     * anchor, and a vector layer with empty source to hold the features.
     *
     * @private
     */
    initOverviewFeatures: function() {
        var me = this;
        me.boxFeature = new ol.Feature();
        me.anchorFeature = new ol.Feature();
        me.extentLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
    },

    /**
     * Initializes the #map from the configuration and the #parentMap.
     *
     * @private
     */
    initOverviewMap: function() {
        var me = this;
        var parentMap = me.getParentMap();
        var parentLayers;

        if (me.getLayers().length < 1) {
            parentLayers = me.getParentMap().getLayers();
            parentLayers.forEach(function(layer) {
                if (layer instanceof ol.layer.Tile ||
                   layer instanceof ol.layer.Image) {
                    me.getLayers().push(layer);
                }
            });
        }
        me.getLayers().push(me.extentLayer);

        if (!me.getMap()) {
            var parentView = parentMap.getView();
            var olMap = new ol.Map({
                controls: new ol.Collection(),
                interactions: new ol.Collection(),
                view: new ol.View({
                    center: parentView.getCenter(),
                    zoom: parentView.getZoom(),
                    projection: parentView.getProjection()
                })
            });
            me.setMap(olMap);
        }

        Ext.each(me.getLayers(), function(layer) {
            me.getMap().addLayer(layer);
        });

        // Set the OverviewMaps center or resolution, on property changed
        // in parentMap.
        parentMap.getView().on('propertychange', me.onParentViewPropChange, me);

        // Update the box after rendering a new frame of the parentMap.
        parentMap.on('postrender', me.updateBox, me);

        // Initially set the center and resolution of the overviewMap.
        me.setOverviewMapProperty('center');
        me.setOverviewMapProperty('resolution');

        me.extentLayer.getSource().addFeatures([
            me.boxFeature,
            me.anchorFeature
        ]);
    },

    /**
     * Enable everything we need to be able to drag the extent box on the
     * overview map, and to properly handle drag events (e.g. recenter on
     * finished dragging).
     */
    setupDragBehaviour: function() {
        var me = this;
        var dragInteraction = new ol.interaction.Translate({
            features: new ol.Collection([me.boxFeature])
        });
        me.getMap().addInteraction(dragInteraction);
        dragInteraction.setActive(true);
        dragInteraction.on('translating', me.repositionAnchorFeature, me);
        dragInteraction.on('translateend', me.recenterParentFromBox, me);
        me.dragInteraction = dragInteraction;
    },

    /**
     * Disable / destroy everything we need to be able to drag the extent box on
     * the overview map. Unregisters any events we might have added and removes
     * the `ol.interaction.Translate`.
     */
    destroyDragBehaviour: function() {
        var me = this;
        var dragInteraction = me.dragInteraction;
        if (!dragInteraction) {
            return;
        }
        me.getMap().removeInteraction(dragInteraction);
        dragInteraction.un('translating', me.repositionAnchorFeature, me);
        dragInteraction.un('translateend', me.recenterParentFromBox, me);
        dragInteraction.setActive(false);
        me.dragInteraction = null;
    },

    /**
     * Repositions the #anchorFeature during dragging sequences of the box.
     * Called while the #boxFeature is being dragged.
     */
    repositionAnchorFeature: function() {
        var me = this;
        var boxCoords = me.boxFeature.getGeometry().getCoordinates();
        var topLeftCoord = boxCoords[0][1];
        var newAnchorGeom = new ol.geom.Point(topLeftCoord);
        me.anchorFeature.setGeometry(newAnchorGeom);
    },

    /**
     * Recenters the #parentMap to the center of the extent of the #boxFeature.
     * Called when dragging of the #boxFeature ends.
     */
    recenterParentFromBox: function() {
        var me = this;
        var parentMap = me.getParentMap();
        var parentView = parentMap.getView();
        var currentMapCenter = parentView.getCenter();
        var panAnimation = ol.animation.pan({
            duration: me.getRecenterDuration(),
            source: currentMapCenter
        });
        var boxExtent = me.boxFeature.getGeometry().getExtent();
        var boxCenter = ol.extent.getCenter(boxExtent);
        parentMap.beforeRender(panAnimation);
        parentView.setCenter(boxCenter);
    },

    /**
     * Called when a property of the parent maps view changes.
     *
     * @param {ol.ObjectEvent} evt The event emitted by the `ol.Object`.
     * @private
     */
    onParentViewPropChange: function(evt) {
        if (evt.key === 'center' || evt.key === 'resolution') {
            this.setOverviewMapProperty(evt.key);
        }
    },

    /**
     * Handler for the click event of the overview map. Recenters the parent
     * map to the clicked location.
     *
     * @param {ol.MapBrowserEvent} evt The click event on the map.
     * @private
     */
    overviewMapClicked: function(evt) {
        var me = this;
        var parentMap = me.getParentMap();
        var parentView = parentMap.getView();
        var currentMapCenter = parentView.getCenter();
        var panAnimation = ol.animation.pan({
            duration: me.getRecenterDuration(),
            source: currentMapCenter
        });
        parentMap.beforeRender(panAnimation);
        parentView.setCenter(evt.coordinate);
    },

    /**
     * Updates the Geometry of the extentLayer.
     */
    updateBox: function() {
        var me = this;
        var parentMapView = me.getParentMap().getView();
        var parentExtent = parentMapView.calculateExtent(
            me.getParentMap().getSize()
        );
        var parentRotation = parentMapView.getRotation();
        var parentCenter = parentMapView.getCenter();
        var geom = ol.geom.Polygon.fromExtent(parentExtent);

        geom = me.self.rotateGeomAroundCoord(
            geom, parentCenter, parentRotation
        );
        me.boxFeature.setGeometry(geom);

        var anchor = new ol.geom.Point(ol.extent.getTopLeft(parentExtent));
        anchor = me.self.rotateGeomAroundCoord(
            anchor, parentCenter, parentRotation
        );
        me.anchorFeature.setGeometry(anchor);
    },

    /**
     * Set an OverviewMap property (center or resolution).
     *
     * @param {String} key The name of the property, either `'center'` or
     *     `'resolution'`
     */
    setOverviewMapProperty: function(key) {
        var me = this;
        var parentView = me.getParentMap().getView();
        var overviewView = me.getMap().getView();

        if (key === 'center') {
            overviewView.set('center', parentView.getCenter());
        }
        if (key === 'resolution') {
            overviewView.set('resolution',
                   me.getMagnification() * parentView.getResolution());
        }
    },

    /**
     * The applier for the #recenterOnClick configuration. Takes care of
     * initially registering an appropriate eventhandler and also unregistering
     * if the property changes.
     *
     * @param {Boolean} shallRecenter The value for #recenterOnClick that was
     *     set.
     * @return {Boolean} The value for #recenterOnClick that was passed.
     */
    applyRecenterOnClick: function(shallRecenter) {
        var me = this;
        var map = me.getMap();

        if (!map) {
            me.addListener('afterrender', function() {
                // set the property again, and re-trigger the 'apply…'-sequence
                me.setRecenterOnClick(shallRecenter);
            }, me, {single: true});
            return shallRecenter;
        }
        if (shallRecenter) {
            map.on('click', me.overviewMapClicked, me);
        } else {
            map.un('click', me.overviewMapClicked, me);
        }
        return shallRecenter;
    },

    /**
     * The applier for the #enableBoxDrag configuration. Takes care of initially
     * setting up an interaction if desired or destroying when dragging is not
     * wanted.
     *
     * @param {Boolean} shallEnableBoxDrag The value for #enableBoxDrag that was
     *     set.
     * @return {Boolean} The value for #enableBoxDrag that was passed.
     */
    applyEnableBoxDrag: function(shallEnableBoxDrag) {
        var me = this;
        var map = me.getMap();

        if (!map) {
            me.addListener('afterrender', function() {
                // set the property again, and re-trigger the 'apply…'-sequence
                me.setEnableBoxDrag(shallEnableBoxDrag);
            }, me, {single: true});
            return shallEnableBoxDrag;
        }
        if (shallEnableBoxDrag) {
            me.setupDragBehaviour();
        } else {
            me.destroyDragBehaviour();
        }
        return shallEnableBoxDrag;
    },

    /**
     * Cleanup any listeners we may have bound.
     */
    onBeforeDestroy: function() {
        var me = this;
        var map = me.getMap();
        var parentMap = me.getParentMap();
        var parentView = parentMap && parentMap.getView();

        if (map) {
            // unbind recenter listener, if any
            map.un('click', me.overviewMapClicked, me);
        }

        me.destroyDragBehaviour();

        if (parentMap) {
            // unbind parent listeners
            parentMap.un('postrender', me.updateBox, me);
            parentView.un('propertychange', me.onParentViewPropChange, me);
        }
    },

    /**
     * Update the size of the ol.Map onResize.
     *
     * TODO can we reuse the mapcomponent code? Perhaps even for this complete
     *     class???
     * @private
     */
    onResize: function() {
        // Get the corresponding view of the controller (the mapPanel).
        var me = this;
        var div = me.getEl().dom;
        var map = me.getMap();

        if (!me.mapRendered) {
            map.setTarget(div);
            me.mapRendered = true;
        } else {
            me.getMap().updateSize();
        }
    },

    /**
     * The applier for the anchor style.
     *
     * @param {ol.Style} style The new style for the anchor feature that was
     *     set.
     * @return {ol.Style} The new style for the anchor feature.
     */
    applyAnchorStyle: function(style) {
        this.anchorFeature.setStyle(style);
        return style;
    },

    /**
     * The applier for the box style.
     *
     * @param {ol.Style} style The new style for the box feature that was set.
     * @return {ol.Style} The new style for the box feature.
     */
    applyBoxStyle: function(style) {
        this.boxFeature.setStyle(style);
        return style;
    }
});
