Ext.define('GeoExt.data.MapfishPrintProvider', {
    extend: 'Ext.Base',
    mixins: ['Ext.mixin.Observable'],
    requires: [
        'GeoExt.data.model.PrintCapability',
        'Ext.data.JsonStore'
    ],

    config: {
        capabilities: null
    },

    capabilityRec: null,

    constructor: function(cfg){
        if (!cfg.capabilities) {
            Ext.Error.raise('Print capabilities required');
        }
        this.initConfig(cfg);

        this.fillCapabilityRec();
    },

    fillCapabilityRec: function() {
        var store = Ext.create('Ext.data.JsonStore', {
            model: GeoExt.data.model.PrintCapability
        });
        store.loadRawData(this.getCapabilities());

        this.capabilityRec = store.getAt(0);
    },

    getLayouts: function() {
        return this.capabilityRec.layouts();
    },

    getFormats: function() {
        return this.capabilityRec.get('formats');
    }
});