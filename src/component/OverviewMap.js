Ext.define("GeoExt.component.OverviewMap", {
    extend: 'Ext.Component',
    xtype: 'gx_overviewmap',

    requires: [
        'GeoExt.component.OverviewMapController'
    ],

    controller: "component-overviewmap",

    config: {
        /**
         * If set to true the overview will be reinitialized on "baselayerchange"
         * events of its bound map.
         * This can be used to make sure that the overview shows the same baselayer
         * as the map.
         *
         * @cfg {Boolean}
         */
        dynamic: false,

        /**
         * An ol.Collection of ol.layers.Base. If not defined on construction, the
         * layers of the parentMap will be used.
         */
        layers: null,

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

    
    /**
     * Reference to the OpenLayers.Control.OverviewMap control.
     *
     * @property @readonly {OpenLayers.Control.OverviewMap}
     */
    ctrl: null,

    initComponent: function() {
        if (!this.getParentMap()) {
            Ext.Error.raise('No Map defined for overviewMap');
        } else {
            this.initOverviewMap();
        }

        this.callParent();
    },

    initOverviewMap: function(){
        var me = this,
            overviewMap = me.getMap(),
            layers = me.getLayers();

        if(!layers){
            layers = me.getParentMap().getLayers();
            me.setLayers(layers);
        }

        if(!overviewMap){
            var olMap = new ol.Map({
                controls: new ol.Collection(),
                interactions: new ol.Collection(),
                layers: layers
            });
            me.setMap(olMap);
        }
    }
});
