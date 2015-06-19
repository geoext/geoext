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

    model: 'GeoExt.data.model.LayerTreeNode',

    config: {
        /**
         * The ol.layer.Group that the tree is derived from.
         * @cfg {ol.layerGroup}
         */
        layerGroup: null,

        /**
         * The layer property that will be used to label tree nodes.
         * @cfg {String}
         */
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

    listeners: {
        /**
         * Inits the tree store by cascading down the provided ol.layer.Group
         * appending each sublayer.
         * TODO: Make provided ol.layer.Group the root node.
         *
         * @inheritDoc
         */
        nodebeforeExpand: function(node){
            var me = this;
            if(node.isRoot()){
                me.addLayerNode(node, me.layerGroup);
            }
        }
    },

    /**
     * Adds a layer as a child to a node. It can be either an
     * GeoExt.data.model.Layer or an ol.layer.Base.
     *
     * @param {Ext.data.NodeInterface} node
     * @rec {GeoExt.data.model.Layer/ol.layer.Base} rec
     */
    addLayerNode: function(node, rec){
        var me = this,
            layer = rec instanceof ol.layer.Base ? rec : rec.data;

        if(layer instanceof ol.layer.Group){
            var folderNode = node.appendChild(layer);
            layer.getLayers().forEach(function(childLayer){
                me.addLayerNode(folderNode, childLayer);
            });
        } else {
            layer.text = layer.get(me.getTextProperty());
            node.appendChild(layer);
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
