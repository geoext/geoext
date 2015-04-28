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
         * An ol.Collection of ol.layers.Base. If not defined on construction, the
         * layers of the parentMap will be used.
         */
        layers: new ol.Collection(),

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
        parentMap: null,

        /**
         * The magnification is the relationship in which the resolution of the
         * overviewmaps view is bigger then resolution of the parentMaps view.
         * @cfg {Number} magnification
         */
        magnification: 5
    },

    /**
     * The ol.layer.Vector displaying the extent geometry of the parentMap.
     */
    extentLayer: new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature()]
        })
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
        this.callParent();
    },

    /**
     * TODO
     */
    initOverviewMap: function(){
        var me = this,
            parentMap = me.getParentMap(),
            parentLayers;

        if(me.getLayers().getLength() < 1){
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
                layers: me.getLayers(),
                view: new ol.View({
                    center: parentMap.getView().getCenter(),
                    zoom: parentMap.getView().getZoom()
                  })
            });
            me.setMap(olMap);
        }

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

    // TODO: This should be moved to the controller.
    /**
     * Updates the Geometry of the extentLayer.
     */
    updateBox: function(){
        var me = this,
            parentExtent = me.getParentMap().getView()
                .calculateExtent(me.getParentMap().getSize()),
            geom = ol.geom.Polygon.fromExtent(parentExtent);
        me.extentLayer.getSource().getFeatures()[0].setGeometry(geom);
    },

    // TODO: This should be moved to the controller.
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
    }
});
