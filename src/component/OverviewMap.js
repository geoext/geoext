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
        layers: new ol.Collection,

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
        magnification: 10,
    },

    /**
     * The ol.layer.Vector displaying the extent geometry of the parentMap.
     */
    extentLayer: new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature()]
        })
    }),

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

    initOverviewMap: function(){
        var me = this,
            parentMap = me.getParentMap();

        if(me.getLayers().getLength() < 1){
            parentLayers = me.getParentMap().getLayers();
            parentLayers.forEach(function(layer, index, parentLayers){
                if(layer instanceof ol.layer.Tile ||
                   layer instanceof ol.layer.Image){
                    me.getLayers().push(layer);
                }
            })
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
         * Sync the maps centers and resolutions (with magnification).
         */
        parentMap.getView().bindTo('center', me.getMap().getView());
        parentMap.getView().bindTo('resolution', me.getMap().getView())
        .transform(
                function(parentMapResolution) {
                    // from sourceView.resolution to targetView.resolution
                    return me.getMagnification() * parentMapResolution;
                },
                function(overviewMapResolution) {
                    // from targetView.resolution to sourceView.resolution
                    return overviewMapResolution / me.getMagnification();
                }
        );

        /*
         * Update the box after rendering a new frame of the parentMap.
         */
        parentMap.on('postrender', function(){
            me.updateBox();
        });
    },

    /**
     * Updates the Geometry of the extentLayer.
     */
    updateBox: function(){
        var me = this,
            parentExtent = me.getParentMap().getView()
                .calculateExtent(me.getParentMap().getSize()),
            geom = ol.geom.Polygon.fromExtent(parentExtent);
        me.extentLayer.getSource().getFeatures()[0].setGeometry(geom)
    }
});
