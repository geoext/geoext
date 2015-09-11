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
 * An GeoExt.component.OverviewMap displays an overview map of an parent map.
 * You can use this component as any other Ext.Component, e.g give it as an item
 * to a panel.
 *
 * Example:
 *
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: new ol.Map({
 *             layers: [layer],
 *             view: new ol.View({
 *                 center: [0, 0],
 *                 zoom: 2
 *             })
 *         })
 *     });
 *
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'GeoExt.component.OverviewMap Example',
 *         width: 800,
 *         height: 600,
 *         items: [mapComponent],
 *         renderTo: 'mapDiv' // ID of the target <div>. Optional.
 *     });
 *
 *     var overviewMap = Ext.create('GeoExt.component.OverviewMap', {
 *         parentMap: olMap
 *     });
 *
 *     var extPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'OverviewMap in Panel',
 *         width: 400,
 *         height: 200,
 *         layout: 'fit',
 *         items: [
 *             overviewMap
 *         ],
 *         renderTo: 'panelDiv' // ID of the target <div>. Optional.
 *     });
 *
 * @class GeoExt.component.OverviewMap
 */
Ext.define("GeoExt.component.OverviewMap", {
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
         * TODO
         * @cfg {ol.Style} anchorStyle
         */
        anchorStyle: null,

        /**
         * TODO
         * @cfg {ol.Style} boxStyle
         */
        boxStyle: null,

        /**
         * An ol.Collection of ol.layers.Base. If not defined on construction,
         * the layers of the parentMap will be used.
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
         * This is the overviewMap itself.
         *
         * @cfg {ol.Map/Object} map
         */
        map: null,

        /**
         * A configured map or a configuration object for the map constructor.
         * This should be the map the overviewMap is bind to.
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
         * Duration time in milliseconds of the panning animation when we
         * recenter the map after a click on the overview. Only has effect
         * if #recenterOnClick is true.
         *
         * @cfg {number} recenterDuration Amount of milliseconds for panning
         *     the parent map to the clicked location.
         */
        recenterDuration: 500
    },

    statics: {
        /**
         * TODO
         */
        rotateCoordsAroundCoords: function(coords, center, rotation){
            var cosTheta = Math.cos(rotation);
            var sinTheta = Math.sin(rotation);

            var x = (cosTheta * (coords[0] - center[0]) - sinTheta *
                    (coords[1] - center[1]) + center[0]);

            var y = (sinTheta * (coords[0] - center[0]) + cosTheta *
                    (coords[1] - center[1]) + center[1]);

            return [x, y];
        },

        /**
         * TODO
         */
        rotateGeomAroundCoords: function(geom, centerCoords, rotation){
            var me = this;
            var ar = [];
            var coords;

            if(geom instanceof ol.geom.Point){
                ar.push(
                    me.rotateCoordsAroundCoords(
                        geom.getCoordinates(), centerCoords, rotation
                    )
                );
                geom.setCoordinates(ar[0]);
            } else if (geom instanceof ol.geom.Polygon){
                coords = geom.getCoordinates()[0];
                coords.forEach(function(coord){
                    ar.push(
                        me.rotateCoordsAroundCoords(
                            coord, centerCoords, rotation
                        )
                    );
                });
                geom.setCoordinates([ar]);
            }
            return geom;
        }
    },

    /**
     * @private
     */
    boxFeature: null,

    /**
     * @private
     */
    anchorFeature: null,

    /**
     * The ol.layer.Vector displaying the extent geometry of the parentMap.
     *
     * @private
     */
    extentLayer: null,

    /**
     * Whether we already rendered an ol.Map in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,

    constructor: function(){
        this.initOverviewFeatures();
        this.callParent(arguments);
    },

    /**
     * TODO
     */
    initComponent: function() {
        var me = this;

        if (!me.getParentMap()){
            Ext.Error.raise('No parentMap defined for overviewMap');
        } else if (!(me.getParentMap() instanceof ol.Map)){
            Ext.Error.raise('parentMap is not an instance of ol.Map');
        }

        me.initOverviewMap();

        me.on('beforedestroy', me.onBeforeDestroy, me);
        me.on('resize', me.onResize, me);

        me.callParent();
    },

    /**
     * TODO
     */
    initOverviewFeatures: function(){
        var me = this;
        me.boxFeature = new ol.Feature();
        me.anchorFeature = new ol.Feature();
        me.extentLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
    },

    /**
     * TODO
     */
    initOverviewMap: function(){
        var me = this,
            parentMap = me.getParentMap(),
            parentLayers;

        if(me.getLayers().length < 1){
            parentLayers = me.getParentMap().getLayers();
            parentLayers.forEach(function(layer){
                if(layer instanceof ol.layer.Tile ||
                   layer instanceof ol.layer.Image){
                    me.getLayers().push(layer);
                }
            });
        }
        me.getLayers().push(me.extentLayer);

        if(!me.getMap()){
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

        Ext.each(me.getLayers(), function(layer){
            me.getMap().addLayer(layer);
        });

        /*
         * Set the OverviewMaps center or resolution, on property changed
         * in parentMap.
         */
        parentMap.getView().on('propertychange', me.onParentViewPropChange, me);

        /*
         * Update the box after rendering a new frame of the parentMap.
         */
        parentMap.on('postrender', me.updateBox, me);

        /*
         * Initially set the center and resolution of the overviewMap.
         */
        me.setOverviewMapProperty('center');
        me.setOverviewMapProperty('resolution');

        me.extentLayer.getSource().addFeatures([
            me.boxFeature,
            me.anchorFeature
        ]);
    },

    /**
     * Called when a property of the parent maps view changes.
     *
     * @private
     */
    onParentViewPropChange: function(evt){
        if (evt.key === 'center' || evt.key === 'resolution'){
            this.setOverviewMapProperty(evt.key);
        }
    },

    /**
     * Handler for the click event of the overview map. Recenters the parent
     * map to the clicked location.
     *
     * @private
     */
    overviewMapClicked: function(evt){
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
    updateBox: function(){
        var me = this,
            parentMapView = me.getParentMap().getView(),
            parentExtent = parentMapView.calculateExtent(
                me.getParentMap().getSize()
            ),
            parentRotation = parentMapView.getRotation(),
            parentCenter = parentMapView.getCenter(),
            geom = ol.geom.Polygon.fromExtent(parentExtent);

        geom = me.self.rotateGeomAroundCoords(
            geom, parentCenter, parentRotation
        );
        me.boxFeature.setGeometry(geom);

        var anchor = new ol.geom.Point(ol.extent.getTopLeft(parentExtent));
        anchor = me.self.rotateGeomAroundCoords(
            anchor, parentCenter, parentRotation
        );
        me.anchorFeature.setGeometry(anchor);
    },

    /**
     * Set an OverviewMap property (center or resolution).
     */
    setOverviewMapProperty: function(key){
        var me = this,
            parentView = me.getParentMap().getView(),
            overviewView = me.getMap().getView();

        if(key === 'center'){
            overviewView.set('center', parentView.getCenter());
        }
        if(key === 'resolution'){
            overviewView.set('resolution',
                   me.getMagnification() * parentView.getResolution());
        }
    },

    /**
     * The applier for recenterOnClick method. Takes care of initially
     * registering an appropriate eventhandler and also unregistering if the
     * property changes.
     */
    applyRecenterOnClick: function(shallRecenter){
        var me = this,
            map = me.getMap();
        if (!map) {
            // TODO or shall we have our own event, once we have a map?
            me.addListener('afterrender', function() {
                // set the property again, and re-trigger the 'apply…'-sequence
                me.setRecenterOnClick(shallRecenter);
            }, me, {single: true});
            return;
        }
        if (shallRecenter) {
            map.on('click', me.overviewMapClicked, me);
        } else {
            map.un('click', me.overviewMapClicked, me);
        }
    },

    /**
     * Cleanup any listeners we may have bound.
     */
    onBeforeDestroy: function(){
        var me = this,
            map = me.getMap(),
            parentMap = me.getParentMap(),
            parentView = parentMap && parentMap.getView();
        if (map) {
            // unbind recenter listener, if any
            map.un('click', me.overviewMapClicked, me);
        }
        if (parentMap) {
            // unbind parent listeners
            parentMap.un('postrender', me.updateBox, me);
            parentView.un('propertychange', me.onParentViewPropChange, me);
        }
    },

    /**
     * Update the size of the ol.Map onResize.
     */
    onResize: function(){
        // Get the corresponding view of the controller (the mapPanel).
        var me = this,
            div = me.getEl().dom,
            map = me.getMap();
        if(!me.mapRendered){
            map.setTarget(div);
            me.mapRendered = true;
        } else {
            me.getMap().updateSize();
        }
    },

    /**
     * TODO
     */
    applyAnchorStyle: function(style){
        this.anchorFeature.setStyle(style);
        return style;
    },

    /**
     * TODO
     */
    applyBoxStyle: function(style){
        this.boxFeature.setStyle(style);
        return style;
    }
});
