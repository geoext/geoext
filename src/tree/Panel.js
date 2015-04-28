/**
 * An Ext.tree.Panel.
 *
 * Example:
 *
 *     var mapPanel = Ext.create('GeoExt.panel.Map', {
 *         title: 'GeoExt.panel.Map Example',
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
 *     var treeStore = Ext.create('GeoExt.data.TreeStore', {
 *         model: 'GeoExt.data.TreeModel',
 *         layerStore: mapPanel.getStore()
 *     });
 *
 *     var treePanel = Ext.create('GeoExt.tree.Panel', {
 *         title: 'treePanel',
 *         width: 400,
 *         height: 600,
 *         store: treeStore,
 *         renderTo: 'treeDiv', // ID of the target <div>. Optional.
 *         rootVisible: false
 *     });
 * @class GeoExt.tree.Panel
 */
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
