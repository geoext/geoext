/**
 * An GeoExt.OverviewMap displays an overview map of an parent map.
 * You can use this component as any other Ext.Component, e.g give it as an item
 * to a panel.
 *
 * Example:
 *
 *     var mapPanel = Ext.create('GeoExt.panel.Map', {
 *         title: 'GeoExt.component.OverviewMap Example',
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
 * @class GeoExt.OverviewMap
 */
Ext.define("GeoExt.component.OverviewMap", {
    extend: 'Ext.Component',
    xtype: 'gx_overviewmap',

    requires: [
        'GeoExt.component.OverviewMapController'
    ],

    controller: "component-overviewmap",

    config: {
        /**
         * TODO
         * @cfg {ol.Style} olStyle
         */
        anchorStyle: null,

        /**
         * TODO
         * @cfg {ol.Style} olStyle
         */
        boxStyle: null,

        /**
         * An ol.Collection of ol.layers.Base. If not defined on construction, the
         * layers of the parentMap will be used.
         */
        layers: [], //new ol.Collection(),

        /**
         * The magnification is the relationship in which the resolution of the
         * overviewmaps view is bigger then resolution of the parentMaps view.
         * @cfg {Number} magnification
         */
        magnification: 5,

        /**
         * A configured map or a configuration object for the map constructor.
         * This is the overviewMap itself.
         * @cfg {ol.Map} map
         */
        map: null,

        /**
         * A configured map or a configuration object for the map constructor.
         * This should be the map the overviewMap is bind to.
         * @cfg {ol.Map} map
         */
        parentMap: null
    },

    statics: {
        /**
         *
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
         *
         */
        rotateGeomAroundCoords: function(geom, centerCoords, rotation){
            var me = this;
            var ar = [];
            var coords;

            if(geom instanceof ol.geom.Point){
                ar.push(me.rotateCoordsAroundCoords(geom.getCoordinates(), centerCoords,
                        rotation));
                geom.setCoordinates(ar[0]);
            } else if (geom instanceof ol.geom.Polygon){
                coords = geom.getCoordinates()[0];
                coords.forEach(function(coord){
                    ar.push(me.rotateCoordsAroundCoords(coord, centerCoords, rotation));
                });
                geom.setCoordinates([ar]);
            }
            return geom;
        }
    },

    /**
     * @private
     */
    boxFeature: new ol.Feature(),

    /**
     * @private
     */
    anchorFeature: new ol.Feature(),

    /**
     * The ol.layer.Vector displaying the extent geometry of the parentMap.
     *
     * @private
     */
    extentLayer: new ol.layer.Vector({
        source: new ol.source.Vector()
    }),

    /**
     * TODO
     */
    initComponent: function() {
        if (!this.getParentMap()){
            Ext.Error.raise('No parentMap defined for overviewMap');
        } else {
            if (!(this.getParentMap() instanceof ol.Map)){
                Ext.Error.raise('parentMap is not an instance of ol.Map');
            } else {
                this.initOverviewMap();
            }
        }

        this.extentLayer.getSource().addFeatures([this.boxFeature,
                                                  this.anchorFeature]);

        this.callParent();
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
            var olMap = new ol.Map({
                target: 'overviewDiv',
                controls: new ol.Collection(),
                interactions: new ol.Collection(),
                view: new ol.View({
                    center: parentMap.getView().getCenter(),
                    zoom: parentMap.getView().getZoom()
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
        parentMap.getView().on('propertychange', function(evt){
            if (evt.key === 'center' || evt.key === 'resolution'){
                this.setOverviewMapProperty(evt.key);
            }
        }, this);

        /*
         * Update the box after rendering a new frame of the parentMap.
         */
        parentMap.on('postrender', function(){
            me.updateBox();
        });

        /*
         * Initially set the center and resolution of the overviewMap.
         */
        this.setOverviewMapProperty('center');
        this.setOverviewMapProperty('resolution');
    },

    // TODO: This should be moved to the controller?!
    /**
     * Updates the Geometry of the extentLayer.
     */
    updateBox: function(){
        var me = this,
            parentExtent = me.getParentMap().getView().calculateExtent(me.getParentMap().getSize()),
            parentRotation = me.getParentMap().getView().getRotation(),
            parentCenter = me.getParentMap().getView().getCenter(),
            geom = ol.geom.Polygon.fromExtent(parentExtent);

        geom = me.self.rotateGeomAroundCoords(geom, parentCenter, parentRotation);
        me.boxFeature.setGeometry(geom);

        var anchor = new ol.geom.Point(ol.extent.getTopLeft(parentExtent));
        anchor = me.self.rotateGeomAroundCoords(anchor, parentCenter, parentRotation);
        me.anchorFeature.setGeometry(anchor);
    },

    // TODO: This should be moved to the controller?!
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
     *
     */
    applyAnchorStyle: function(style){
        this.anchorFeature.setStyle(style);
        return style;
    },

    /**
     *
     */
    applyBoxStyle: function(style){
        this.boxFeature.setStyle(style);
        return style;
    }
});
