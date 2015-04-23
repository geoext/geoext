Ext.define('GeoExt.tree.Panel', {
    extend: 'Ext.tree.Panel',
    xtype: "gx_treepanel",
    
    requires: [
        'GeoExt.tree.PanelController'
    ],

    controller: "tree-panel",

    initComponent: function() {
        var me = this;

        me.callParent();
    }
});