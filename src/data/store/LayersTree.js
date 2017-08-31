/* Copyright (c) 2015-2017 The Open Source Geospatial Foundation
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
 * A store that is synchronized with a GeoExt.data.store.Layers. It can be
 * used by an {Ext.tree.Panel}.
 *
 * @class GeoExt.data.store.LayersTree
 */
Ext.define('GeoExt.data.store.LayersTree', {
    extend: 'Ext.data.TreeStore',

    alternateClassName: ['GeoExt.data.TreeStore'],

    requires: [
        'GeoExt.util.Layer'
    ],

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
         * Configures the behaviour of the checkbox of an `ol.layer.Group`
         * (folder). Possible values are `'classic'` or `'ol3'`.
         *
         * * `'classic'` forwards the checkstate to the children of the folder.
         *   * Check a leaf => all parent nodes are checked
         *   * Uncheck all leafs in a folder => parent node is unchecked
         *   * Check a folder Node => all children are checked
         *   * Uncheck a folder Node => all children are unchecked
         * * `'ol3'` emulates the behaviour of `ol.layer.Group`. So a layerGroup
         *   can be invisible but can have visible children.
         *   * Emulates the behaviour of an `ol.layer.Group,` so a parentfolder
         *     can be unchecked but still contain checked leafs and vice versa.
         *
         * @cfg
         */
        folderToggleMode: 'classic'
    },

    statics: {
        /**
         * A string which we'll us for child nodes to detect if they are removed
         * because their parent collapsed just recently. See the private
         * method #onBeforeGroupNodeToggle for an explanation.
         *
         * @private
         */
        KEY_COLLAPSE_REMOVE_OPT_OUT: '__remove_by_collapse__'
    },

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

    root: {
        expanded: true
    },

    /**
     * Constructs a LayersTree store.
     */
    constructor: function() {
        var me = this;
        me.callParent(arguments);

        var collection = me.layerGroup.getLayers();
        Ext.each(collection.getArray(), function(layer) {
            me.addLayerNode(layer);
        }, me, me.inverseLayerOrder);

        me.bindGroupLayerCollectionEvents(me.layerGroup);

        me.on({
            remove: me.handleRemove,
            noderemove: me.handleNodeRemove,
            nodeappend: me.handleNodeAppend,
            nodeinsert: me.handleNodeInsert,
            scope: me
        });
    },

    /**
     * Applies the #folderToggleMode to the treenodes.
     *
     * @param {String} folderToggleMode The folderToggleMode that was set.
     * @return {String} The folderToggleMode that was set.
     * @private
     */
    applyFolderToggleMode: function(folderToggleMode) {
        if (folderToggleMode === 'classic' || folderToggleMode === 'ol3') {
            var rootNode = this.getRootNode();
            if (rootNode) {
                rootNode.cascadeBy({
                    before: function(child) {
                        child.set('__toggleMode', folderToggleMode);
                    }
                });
            }
            return folderToggleMode;
        }

        Ext.raise('Invalid folderToggleMode set in ' + this.self.getName()
            + ': ' + folderToggleMode + '; \'classic\' or \'ol3\' are valid.');
    },

    /**
     * Listens to the `remove` event and syncs the attached layergroup.
     *
     * @param {GeoExt.data.store.LayersTree} store The layer store.
     * @param {GeoExt.data.model.LayerTreeNode[]} records An array of the
     *     removed nodes.
     * @private
     */
    handleRemove: function(store, records) {
        var me = this;
        var keyRemoveOptOut = me.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
        me.suspendCollectionEvents();
        Ext.each(records, function(record) {
            if (keyRemoveOptOut in record && record[keyRemoveOptOut] === true) {
                delete record[keyRemoveOptOut];
                return;
            }
            var layerOrGroup = record.getOlLayer();
            if (layerOrGroup instanceof ol.layer.Group) {
                me.unbindGroupLayerCollectionEvents(layerOrGroup);
            }
            var group = GeoExt.util.Layer.findParentGroup(
                layerOrGroup, me.getLayerGroup()
            );
            if (!group) {
                group = me.getLayerGroup();
            }
            if (group) {
                group.getLayers().remove(layerOrGroup);
            }
        });
        me.resumeCollectionEvents();
    },

    /**
     * Listens to the `noderemove` event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode The parent node.
     * @param {GeoExt.data.model.LayerTreeNode} removedNode The removed node.
     * @private
     */
    handleNodeRemove: function(parentNode, removedNode) {
        var me = this;
        var layerOrGroup = removedNode.getOlLayer();
        if (!layerOrGroup) {
            layerOrGroup = me.getLayerGroup();
        }
        if (layerOrGroup instanceof ol.layer.Group) {
            removedNode.un('beforeexpand', me.onBeforeGroupNodeToggle);
            removedNode.un('beforecollapse', me.onBeforeGroupNodeToggle);
            me.unbindGroupLayerCollectionEvents(layerOrGroup);
        }
        var group = GeoExt.util.Layer.findParentGroup(
            layerOrGroup, me.getLayerGroup()
        );

        if (group) {
            me.suspendCollectionEvents();
            group.getLayers().remove(layerOrGroup);
            me.resumeCollectionEvents();
        }
    },

    /**
     * Listens to the `nodeappend` event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode The parent node.
     * @param {GeoExt.data.model.LayerTreeNode} appendedNode The appended node.
     * @private
     */
    handleNodeAppend: function(parentNode, appendedNode) {
        var me = this;
        var group = parentNode.getOlLayer();
        var layer = appendedNode.getOlLayer();

        if (!group) {
            group = me.getLayerGroup();
        }

        // check if the layer is possibly already at the desired index:
        var layerInGroupIdx = GeoExt.util.Layer.getLayerIndex(
            layer, group
        );
        if (layerInGroupIdx === -1) {
            me.suspendCollectionEvents();
            if (me.inverseLayerOrder) {
                group.getLayers().insertAt(0, layer);
            } else {
                group.getLayers().push(layer);
            }
            me.resumeCollectionEvents();
        }
    },

    /**
     * Listens to the `nodeinsert` event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode The parent node.
     * @param {GeoExt.data.model.LayerTreeNode} insertedNode The inserted node.
     * @param {GeoExt.data.model.LayerTreeNode} insertedBefore The node we were
     *     inserted before.
     * @private
     */
    handleNodeInsert: function(parentNode, insertedNode, insertedBefore) {
        var me = this;
        var group = parentNode.getOlLayer();
        if (!group) {
            // can only happen if a node was dragged before the visible root.
            group = me.getLayerGroup();
        }
        var layer = insertedNode.getOlLayer();
        var beforeLayer = insertedBefore.getOlLayer();
        var groupLayers = group.getLayers();
        var beforeIdx = GeoExt.util.Layer.getLayerIndex(beforeLayer, group);
        var insertIdx = beforeIdx;
        if (me.inverseLayerOrder) {
            insertIdx += 1;
        }

        // check if the layer is possibly already at the desired index:
        var currentLayerInGroupIdx = GeoExt.util.Layer.getLayerIndex(
            layer, group
        );
        if (currentLayerInGroupIdx !== insertIdx &&
            !Ext.Array.contains(groupLayers.getArray(), layer)) {
            me.suspendCollectionEvents();
            groupLayers.insertAt(insertIdx, layer);
            me.resumeCollectionEvents();
        }
    },

    /**
     * Adds a layer as a node to the store. It can be an `ol.layer.Base`.
     *
     * @param {ol.layer.Base} layerOrGroup The layer or layer group to add.
     */
    addLayerNode: function(layerOrGroup) {
        var me = this;
        // 2. get group to which the layer was added
        var group = GeoExt.util.Layer.findParentGroup(
            layerOrGroup, me.getLayerGroup()
        );

        // 3. get index of layer in that group
        var layerIdx = GeoExt.util.Layer.getLayerIndex(layerOrGroup, group);

        // 3.1 the index must probably be changed because of inverseLayerOrder
        // TODO Check
        if (me.inverseLayerOrder) {
            var totalInGroup = group.getLayers().getLength();
            layerIdx = totalInGroup - layerIdx - 1;
        }

        // 4. find the node that represents the group
        var parentNode;
        if (group === me.getLayerGroup()) {
            parentNode = me.getRootNode();
        } else {
            parentNode = me.getRootNode().findChildBy(function(candidate) {
                return candidate.getOlLayer() === group;
            }, me, true);
        }
        if (!parentNode) {
            return;
        }

        // 5. insert a new layer node at the specified index to that node
        var layerNode = parentNode.insertChild(layerIdx, layerOrGroup);

        if (layerOrGroup instanceof ol.layer.Group) {
            // See onBeforeGroupNodeToggle for an explanation why we have this
            layerNode.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
            layerNode.on('beforecollapse', me.onBeforeGroupNodeToggle, me);

            var childLayers = layerOrGroup.getLayers().getArray();
            Ext.each(childLayers, me.addLayerNode, me, me.inverseLayerOrder);
        }
    },

    /**
     * Bound as an eventlistener for layer nodes which are a folder / group on
     * the beforecollapse event. Whenever a folder gets collapsed, ExtJS seems
     * to actually remove the children from the store, triggering the removal
     * of the actual layers in the map. This is an undesired behviour. We handle
     * this as follows: Before the collapsing happens, we mark the childNodes,
     * so we effectively opt-out in #handleRemove.
     *
     * @param {Ext.data.NodeInterface} node The collapsible folder node.
     * @private
     */
    onBeforeGroupNodeToggle: function(node) {
        var keyRemoveOptOut = this.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
        node.cascadeBy(function(child) {
            child[keyRemoveOptOut] = true;
        });
    },

    /**
     * A utility method which binds collection change events to the passed layer
     * if it is a `ol.layer.Group`.
     *
     * @param {ol.layer.Base} layerOrGroup The layer to probably bind event
     *     listeners for collection change events to.
     * @private
     */
    bindGroupLayerCollectionEvents: function(layerOrGroup) {
        var me = this;
        if (layerOrGroup instanceof ol.layer.Group) {
            var collection = layerOrGroup.getLayers();
            collection.on('remove', me.onLayerCollectionRemove, me);
            collection.on('add', me.onLayerCollectionAdd, me);
            collection.forEach(me.bindGroupLayerCollectionEvents, me);
        }
    },

    /**
     * A utility method which unbinds collection change events from the passed
     * layer if it is a `ol.layer.Group`.
     *
     * @param {ol.layer.Base} layerOrGroup The layer to probably unbind event
     *     listeners for collection change events from.
     * @private
     */
    unbindGroupLayerCollectionEvents: function(layerOrGroup) {
        var me = this;
        if (layerOrGroup instanceof ol.layer.Group) {
            var collection = layerOrGroup.getLayers();
            collection.un('remove', me.onLayerCollectionRemove, me);
            collection.un('add', me.onLayerCollectionAdd, me);
            collection.forEach(me.unbindGroupLayerCollectionEvents, me);
        }
    },

    /**
     * Handles the `add` event of a managed `ol.layer.Group` and eventually
     * removes the appropriate node.
     *
     * @param {ol.CollectionEvent} evt The event object holding a reference to
     *     the relevant `ol.layer.Base`.
     * @private
     */
    onLayerCollectionAdd: function(evt) {
        var me = this;
        if (me.collectionEventsSuspended) {
            return;
        }
        var layerOrGroup = evt.element;
        me.addLayerNode(layerOrGroup);
        me.bindGroupLayerCollectionEvents(layerOrGroup);
    },

    /**
     * Handles the `remove` event of a managed `ol.layer.Group` and eventually
     * removes the appropriate node.
     *
     * @param {ol.CollectionEvent} evt The event object holding a reference to
     *     the relevant `ol.layer.Base`.
     * @private
     */
    onLayerCollectionRemove: function(evt) {
        var me = this;
        if (me.collectionEventsSuspended) {
            return;
        }
        var layerOrGroup = evt.element;
        // 1. find the node that existed for that layer
        var node = me.getRootNode().findChildBy(function(candidate) {
            return candidate.getOlLayer() === layerOrGroup;
        }, me, true);
        if (!node) {
            return;
        }
        // 2. if grouplayer: cascade down and remove any possible listeners
        if (layerOrGroup instanceof ol.layer.Group) {
            me.unbindGroupLayerCollectionEvents(layerOrGroup);
        }
        // 3. find the parent
        var parent = node.parentNode;
        // 4. remove the node from the parent
        parent.removeChild(node);
    },

    /**
     * Allows for temporarily unlistening to change events on the underlying
     * OpenLayers collections. Use #resumeCollectionEvents to start listening
     * again.
     */
    suspendCollectionEvents: function() {
        this.collectionEventsSuspended = true;
    },

    /**
     * Undoes the effect of #suspendCollectionEvents; so that the store is now
     * listening to change events on the underlying OpenLayers collections
     * again.
     */
    resumeCollectionEvents: function() {
        this.collectionEventsSuspended = false;
    }
});
