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
 */
Ext.define('GeoExt.data.TreeStore', {
    extend: 'Ext.data.TreeStore',

    model: 'GeoExt.data.model.LayerTreeNode',

    config: {
        /**
         * The ol.layer.Group that the tree is derived from.
         * @cfg {ol.layer.Group}
         */
        layerGroup: null,

        /**
         * The layer property that will be used to label tree nodes.
         * @cfg {String}
         */
        textProperty: 'name'
    },

    /**
     * Defines if the given ol.layer.Group while be shown as node or not.
     * @property {boolean}
     */
    showLayerGroupNode: false,

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
         *
         * @inheritDoc
         */
        nodebeforeExpand: function(node){
            var me = this;
            if(node.isRoot()){
                if(me.showLayerGroupNode) {
                    me.addLayerNode(node, me.layerGroup);
                } else {
                    var collection = me.layerGroup.getLayers();
                    collection.once('remove', me.onLayerCollectionChanged, me);
                    collection.once('add', me.onLayerCollectionChanged, me);
                    collection.forEach(function(layer){
                        me.addLayerNode(node, layer);
                    });
                }
            }
        },
        noderemove: function(parentNode, removedNode){
            var me = this;
            if(removedNode.isRoot()){
                return;
            }
            var layer = removedNode.getOlLayer();
            this.__updating = true;
            if(layer instanceof ol.layer.Group){
                var collection = layer.getLayers();
                collection.un('add', me.onLayerCollectionChanged, me);
                collection.un('remove', me.onLayerCollectionChanged, me);
            }
            this.__updating = false;
        }
    },

    /**
     * Adds a layer as a child to a node. It can be either an
     * GeoExt.data.model.Layer or an ol.layer.Base.
     *
     * @param {Ext.data.NodeInterface} node
     * @param {GeoExt.data.model.Layer/ol.layer.Base} rec
     */
    addLayerNode: function(node, rec){
        var me = this,
            layer = rec instanceof ol.layer.Base ? rec : rec.data;

        if(layer instanceof ol.layer.Group){
            layer.getLayers().once('add', this.onLayerCollectionChanged, this);
            layer.getLayers().once('remove', this.onLayerCollectionChanged, this);
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
     *  load() the treeStore when a layer is added to a collection
     *  (ol.layer.Group);
     *
     *  @private
     */
    onLayerCollectionChanged: function(){
        this.load();
    }
});
