Ext.define("GeoExt.panel.Map",{
    extend: "Ext.panel.Panel",
    xtype: "gx_mappanel",

    requires: [
        'GeoExt.data.LayerStore',
        'GeoExt.panel.MapController'
//        'GeoExt.panel.MapModel'
    ],

    controller: "panel-map",
//    viewModel: {
//        type: "panel-map"
//    },

    layout: 'fit',

    /**
     * Whether we already rendered an ol.Map in this panel. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,

    layerStore: null,

    config: {
        /**
         * A configured map or a configuration object for the map constructor.
         * @cfg {ol.Map} map
         */
        map: null
    },

    initComponent: function() {
        var me = this;
        if(!(me.getMap() instanceof ol.Map)){
            var olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
            me.setMap(olMap);
        }

        me.layerStore = Ext.create('GeoExt.data.LayerStore', {
            map: me.getMap()
        });

        this.callParent();
    },

    listeners: {
        /*
         * Logic in ViewController
         */
        resize: 'onResize'
    },

    // We need to figure out what we want to be able to do via GeoExt

    /**
     * Returns the center coordinate of the view.
     * @return ol.Coordinate
     */
    getCenter: function(){
        return this.getMap().getView().getCenter();
    },

    /**
     * Set the center of the view.
     * @param center ol.Coordinate
     */
    setCenter: function(center){
        this.getMap().getView().setCenter(center);
    },

    /**
     * Returns the extent of the current view.
     * @return ol.Extent
     */
    getExtent: function(){
        return this.getView().calculateExtent(this.getMap().getSize());
    },

    /**
     * Set the extent of the view.
     * @param extent ol.Extent
     */
    setExtent: function(extent){
        this.getView().fitExtent(extent, this.getMap().getSize());
    },

//    // The layer part may be adapted to an upcoming layer store.
//    /**
//     * Returns the layers of the map.
//     * @return ol.Collection
//     */
//    getLayers: function(){
//        return this.getMap().getLayers();
//    },
//
//    /**
//     * Add a layer to the map.
//     * @param layer ol.layer.Base
//     */
//    addLayer: function(layer){
//        this.getMap().addLayer(layer);
//    },

    /**
     * Returns the view of the map.
     * @return ol.View
     */
    getView: function(){
        return this.getMap().getView();
    },

    /**
     * Set the view of the map.
     * @param view ol.View
     */
    setView: function(view){
        this.getMap().setView(view);
    }
});
