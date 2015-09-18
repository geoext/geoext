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
 * A store that is synchronized with a GeoExt.data.store.Layers. It will be used
 * by a GeoExt.tree.Panel.
 *
 * @class GeoExt.data.store.LayersTree
 */
Ext.define('GeoExt.data.store.LayersTree', {
    extend: 'Ext.data.TreeStore',

    alternateClassName: ['GeoExt.data.TreeStore'],

    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.Collection',
        'ol.Collection#getArray',
        'ol.Collection#once',
        'ol.Collection#un',
        'ol.layer.Base',
        'ol.layer.Base#get',
        'ol.layer.Group',
        'ol.layer.Group#get',
        'ol.layer.Group#getLayers'
    ],
    // </debug>

    model: 'GeoExt.data.model.LayerTreeNode',

    config: {
        /**
         * The ol.layer.Group that the tree is derived from.
         *
         * @cfg {ol.layer.Group}
         */
        layerGroup: null,

        /**
         * The layer property that will be used to label tree nodes.
         *
         * @cfg {String}
         */
        textProperty: 'name',

        /**
         * Configures the behaviour of the checkbox of an ol.layer.Group
         * (folder). Possible values are 'classic' or 'ol3'.
         * 'classic' forwards the checkstate to the children of the folder.
         * 'ol3' emulates the behaviour of ol.layer.Group. So an layerGroup can
         * be invisible but can have visible children.
         * 'classic':
         *   - Check a leaf --> all parent nodes are checked
         *   - Uncheck all leafs in a folder --> parent node is unchecked
         *   - Check a folder Node --> all children are checked
         *   - Uncheck a folder Node --> all children are unchecked
         * 'ol3':
         *   - Emulates the behaviour of an ol.layer.Group, so a parentfolder
         *     can be unchecked but still contain checked leafs and vice versa.
         * @cfg
         */
        folderToggleMode: 'classic'
    },

    /**
     * Defines if the given ol.layer.Group while be shown as node or not.
     *
     * @property {Boolean}
     */
    showLayerGroupNode: false,

    /**
     * Defines if the order of the layers added to the store will be
     * reversed. The default behaviour and what most users expect is
     * that mapLayers on top are also on top in the tree.
     *
     * @property {Boolean}
     */
    inverseLayerOrder: true,

    /**
     * Whether the treestore currently shall handle openlayers collection
     * change events. See #suspendCollectionEvents and #resumeCollectionEvents.
     *
     * @property
     * @private
     */
    collectionEventsSuspended: false,

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

    constructor: function(){
        var me = this;
        me.callParent(arguments);
        me.on('nodebeforeexpand', me.handleNodeBeforeExpand, me);
        me.on('noderemove', me.handleNodeRemove, me);
    },

    /**
     * Apllies the folderToggleMode to the treenodes.
     * @private
     */
    applyFolderToggleMode: function(folderToggleMode){

        if(folderToggleMode === 'classic' || folderToggleMode === 'ol3'){
            var rootNode = this.getRootNode();
            if(rootNode){
                rootNode.cascadeBy({
                    before: function(child){
                        child.set('__toggleMode', folderToggleMode);
                    }
                });
            }
        } else {
            Ext.raise("Invalid folderToggleMode "
                + "set in 'GeoExt.data.store.LayersTree': "
                + folderToggleMode + ". 'classic' or 'ol3' are valid.");
        }
        return folderToggleMode;
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
            layer = rec instanceof ol.layer.Base ? rec : rec.data,
            textProperty = me.getTextProperty(),
            folderNode,
            subLayers;

        if(layer instanceof ol.layer.Group){
            node.set('__toggleMode', me.getFolderToggleMode());
            subLayers = layer.getLayers();
            subLayers.once('add', me.onLayerCollectionChanged, me);
            subLayers.once('remove', me.onLayerCollectionChanged, me);
            layer.text = layer.get(textProperty);
            folderNode = node.appendChild(layer);
            Ext.each(subLayers.getArray(), function(childLayer) {
                me.addLayerNode(folderNode, childLayer);
            }, me, me.inverseLayerOrder);
        } else {
            layer.text = layer.get(textProperty);
            node.appendChild(layer);
        }
    },

    /**
     * Listens to the nodebeforeexpand event. Adds nodes corresponding to the
     * data type.
     *
     * @param {GeoExt.data.model.LayerTreeNode} node
     * @private
     */
    handleNodeBeforeExpand: function(node){
        var me = this;
        if(node.isRoot()){
            if(me.showLayerGroupNode) {
                me.addLayerNode(node, me.layerGroup);
            } else {
                var collection = me.layerGroup.getLayers();
                collection.once('remove', me.onLayerCollectionChanged, me);
                collection.once('add', me.onLayerCollectionChanged, me);
                Ext.each(collection.getArray(), function(layer) {
                    me.addLayerNode(node, layer);
                }, me, me.inverseLayerOrder);
            }
        }
    },

    /**
     * Listens to the noderemove event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode
     * @param {GeoExt.data.model.LayerTreeNode} removedNode
     * @private
     */
    handleNodeRemove: function(parentNode, removedNode){
        var me = this;
        if(removedNode.isRoot()){
            return;
        }
        var layer = removedNode.getOlLayer();
        if(layer instanceof ol.layer.Group){
            var collection = layer.getLayers();
            collection.un('add', me.onLayerCollectionChanged, me);
            collection.un('remove', me.onLayerCollectionChanged, me);
        }
    },

    /**
     *  Remove children from rootNode and read the layerGroup-collection.
     *
     *  @private
     */
    onLayerCollectionChanged: function(){
        var me = this;
        if (me.collectionEventsSuspended) {
            return;
        }

        // remove all filters as long as we take care of the changed collection
        // but keep a reference so we can add them in later
        var currentFilters = me.getFilters();
        var restoreFilters = [];
        currentFilters.each(function(currentFilter) {
            restoreFilters.push(currentFilter);
            me.removeFilter(currentFilter);
        });
        me.getRootNode().removeAll();
        if(me.showLayerGroupNode) {
            me.addLayerNode(me.getRootNode(), me.getLayerGroup());
        } else {
            var collection = me.getLayerGroup().getLayers();
            collection.once('remove', me.onLayerCollectionChanged, me);
            collection.once('add', me.onLayerCollectionChanged, me);
            Ext.each(collection.getArray(), function(layer) {
                me.addLayerNode(me.getRootNode(), layer);
            }, me, me.inverseLayerOrder);
        }

        // now restore any filters we previously had
        me.addFilter(restoreFilters);
    },

    /**
     * Allows for temporarily unlistening to change events on the underlying
     * OpenLayers collections. Use #resumeCollectionEvents to start listening
     * again.
     */
    suspendCollectionEvents: function(){
        this.collectionEventsSuspended = true;
    },

    /**
     * Undoes the effect of #suspendCollectionEvents; so that the store is now
     * listening to change events on the underlying OpenLayers collections.
     * again.
     */
    resumeCollectionEvents: function(){
        this.collectionEventsSuspended = false;
    }
});
