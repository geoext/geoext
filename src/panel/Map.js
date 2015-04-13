Ext.define("GeoExt.panel.Map",{
    extend: "Ext.panel.Panel",
    xtype: "gx_mappanel",

    controller: "panel-map",

    viewModel: {
        type: "panel-map"
    },

    config: {

        center: null,

        extent: null,

        layers: null,

        map: null,

        mapRendered: false,

        zoom: null

    },

    html: "This is a mappanel!!",

    layout: 'fit',

    constructor: function(mapConf){
        if(!Ext.isempty(mapConf)){
            Ext.Object.each(mapConf, function(k,v){
                this[k] = v;
            })
        }
    }

});
