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
 * An Ext.tree.Panel.
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
 *         title: 'GeoExt.component.Map Example',
 *         width: 800,
 *         height: 600,
 *         items: [mapComponent],
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
    alias: [
        "widget.gx_treepanel",
        "widget.gx_tree_panel"
    ],

    initComponent: function() {
        var me = this;

        me.callParent();
    }
});
