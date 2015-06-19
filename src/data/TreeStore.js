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
 * A store that is synchronized with a GeoExt.data.LayerStore. It will be used
 * by a GeoExt.tree.Panel.
 *
 * @class GeoExt.data.TreeStore
 */
Ext.define('GeoExt.data.TreeStore', {
    extend: 'Ext.data.TreeStore',

    requires: [
        'GeoExt.data.LayerStore'
    ],

    config: {
        layerStore: null,
        textProperty: 'name'
    },

    /**
     * @cfg
     * @inheritdoc Ext.data.TreeStore
     */
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    constructor: function(config){
        var me = this;

        if(!me.getLayerStore()){
            me.setLayerStore(config.layerStore);
        }

        me.callParent([config]);
    },

    listeners: {
        nodebeforeExpand: function(node){
            var me = this;
            if(node.isRoot()){
                Ext.each(me.getLayerStore().getRange(), function(rec){
                    me.addLayerNode(node, rec);
                });
            }
        },
        update: function(store, record){
            if(record.data instanceof ol.layer.Base){
                record.data.setVisible(record.data.checked);
            }
        }
    },

    /**
     * Adds a layer as a child to a node. It can be either an
     * GeoExt.data.model.layer.Base or an ol.layer.Base.
     *
     * @param {Ext.data.NodeInterface} node
     * @rec {GeoExt.data.model.layer.Base/ol.layer.Base} rec
     */
    addLayerNode: function(node, rec){
        var me = this,
            layer = rec instanceof ol.layer.Base ? rec : rec.data;

        layer.checked = layer.visible;
        layer.on('change:visible', me.onLayerVisibleChange, me);

        if(layer instanceof ol.layer.Group){
            var folderNode = node.appendChild(layer);
            layer.text = 'ol.layer.Group';
            layer.treeNode = folderNode;
            layer.getLayers().forEach(function(childLayer){
                childLayer.visible = layer.visible;
                me.addLayerNode(folderNode, childLayer);
            });
        } else {
            layer.text = layer.get(me.getTextProperty());
            layer.leaf = true;
            var layerNode = node.appendChild(layer);
            layer.treeNode = layerNode;
        }
    },

    /**
     * Checks/Unchecks the checkbox of a treenode if the layers visibility
     * changed from mapside.
     *
     * @private
     * @param {ol.ObjectEvent} evt
     */
    onLayerVisibleChange: function(evt){
        var me = this,
            layer = evt.target,
            layerNode = me.getNodeById(layer.id);

        if(layerNode && layer){
            layerNode.set('checked', layer.getVisible());
        }
    }
});
