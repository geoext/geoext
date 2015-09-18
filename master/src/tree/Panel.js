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
 *     var treeStore = Ext.create('GeoExt.data.store.LayersTree', {
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
 *
 * @class GeoExt.tree.Panel
 */
Ext.define('GeoExt.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: [
        "widget.gx_treepanel",
        "widget.gx_tree_panel"
    ],

    requires: [
        'Ext.tree.plugin.TreeViewDragDrop'
    ],

    statics: {
        /**
         * A utility method to find the `ol.layer.Group` which is the direct
         * parent of the passed layer. Searching starts at the passed
         * startGroup. If `undefined` is returned, the layer is not a child of
         * the `startGroup`.
         *
         * @param {ol.layer.Base} childLayer The layer whose group we want.
         * @param {ol.layer.Group} startGroup The group layer that we will start
         *     searching in.
         * @return {ol.layer.Group} The direct parent group or undefined if the
         *     group cannot be determined.
         */
        findParentGroup: function(childLayer, startGroup){
            var parentGroup,
                findParentGroup = GeoExt.tree.Panel.findParentGroup,
                getLayerIndex = GeoExt.tree.Panel.getLayerIndex;

            if (getLayerIndex(childLayer, startGroup) !== -1) {
                parentGroup = startGroup;
            } else {
                startGroup.getLayers().forEach(function(layer){
                    if (!parentGroup && layer instanceof ol.layer.Group) {
                        parentGroup = findParentGroup(childLayer, layer);
                        // sadly we cannot abort the forEach-iteration here
                    }
                });
            }

            return parentGroup;
        },

        /**
         * A utility method to determine the zero based index of a layer in a
         * layer group. Will return `-1` if the layer isn't a direct child of
         * the group.
         *
         * @param {ol.layer.Base} layer The layer whose index we want.
         * @param {ol.layer.Group} group The group to search in.
         * @return {Number} The index or `-1` if the layer isn't a direct child
         *     of the group.
         */
        getLayerIndex: function(layer, group){
            var index = -1;

            group.getLayers().forEach(function(candidate, idx){
                if (index === -1 && candidate === layer) {
                    index = idx;
                    // sadly we cannot abort the forEach-iteration here
                }
            });

            return index;
        }
    },

    config: {
        /**
         * Whether to allow the rearranging of the layer hierarchy by dragging
         * and dropping layers in the tree.
         */
        dragDrop: true
    },

    /**
     * Constructor function for tree panels.
     */
    constructor: function() {
        var me = this,
            treeView;

        me.callParent(arguments);

        // initialize the dragdrop plugin and register appropriate handlers.
        if (me.getDragDrop()) {
            treeView = me.getView();
            if (me.needsDragDropPlugin()) {
                treeView.addPlugin({
                    ptype: 'treeviewdragdrop'
                });
            }
            treeView.on({
                beforedrop: me.handleLayerBeforeDrop,
                drop: me.handleLayerDrop,
                scope: me
            });
        }
    },

    /**
     * Determines whether our tree view already has a drag and drop plugin, so
     * that we do not add it again.
     *
     * @return {Boolean} Whether we need to add the `TreeViewDragDrop` plugin.
     * @private
     */
    needsDragDropPlugin: function(){
        var plugins = this.getView().getPlugins(),
            needsDragDropPlugin = true;

        if (plugins !== null && Ext.isArray(plugins)) {
            Ext.each(plugins, function(plugin){
                if (plugin instanceof Ext.tree.plugin.TreeViewDragDrop) {
                    needsDragDropPlugin = false;
                    return false; // stop iteration
                }
            });
        }

        return needsDragDropPlugin;
    },

    /**
     * Called as handler for beforedrop, this method decides whether to cancel
     * or allow the drop. The dropoperation must be cancelled if the store was
     * configured with `showLayerGroupNode: true`, and the user dragged a node
     * before or outside the topmost group. In such a case we return false and
     * effectively cancel the drop.
     *
     * @param {HTMLElement} node The TreeView node **if any** over which the
     *     mouse was positioned.
     * @param {Object} data The data object gathered at mousedown time
     * @param {Ext.data.Model} overModel The Model over which the drop gesture
     *     took place.
     * @param {String} dropPosition `"before"`, `"after"` or `"append"`
     *     depending on whether the mouse is above or below the midline of the
     *     node, or the node is a branch node which accepts new child nodes.
     */
    handleLayerBeforeDrop: function(node, data, overModel, dropPosition) {
        var me = this,
            store = me.getStore(),
            allowDrop = true,
            topmostGroup,
            droppedOnLayer;

        if (store.showLayerGroupNode) {
            topmostGroup = store.getLayerGroup();
            droppedOnLayer = overModel.getOlLayer();
            if (dropPosition !== 'append' && droppedOnLayer === topmostGroup) {
                allowDrop = false;
            }
        }
        return allowDrop;
    },

    /**
     * Called when a drag and drop has finished, and orders the layers in the
     * collection.
     *
     * @param {HTMLElement} node The TreeView node **if any** over which the
     *     mouse was positioned.
     * @param {Object} data The data object gathered at mousedown time
     * @param {Ext.data.Model} overModel The Model over which the drop gesture
     *     took place.
     * @param {String} dropPosition `"before"`, `"after"` or `"append"`
     *     depending on whether the mouse is above or below the midline of the
     *     node, or the node is a branch node which accepts new child nodes.
     * @private
     */
    handleLayerDrop: function(node, data, overModel, dropPosition) {
        var me = this,
            // shorter aliases for some static methods
            findParentGroup = GeoExt.tree.Panel.findParentGroup,
            getLayerIndex = GeoExt.tree.Panel.getLayerIndex,
            // for comparisons with the passed dropPosition
            dropPosBefore = 'before',
            dropPosAfter = 'after',
            // tree store and related information
            store = me.getStore(),
            inverseLayerOrder = store.inverseLayerOrder,
            topMostGroup = store.getLayerGroup(),
            // the actual layer that was dragged
            draggedLayer = data.records[0].getOlLayer(),
            // the layer the drop ended on
            droppedOnLayer = overModel.getOlLayer(),
            // ol.layer.Groups that contain dragged or droppedOn layers
            sourceGroup,
            targetGroup,
            // the indices of the layers in these groups
            draggedLayerIdx,
            droppedOnLayerIdx,
            // the final index at which the new layer will appear
            targetLayerColl,
            targetIndex;

        // prevent the store / tree from redrawing while we fuddle with it
        store.suspendCollectionEvents();

        sourceGroup = findParentGroup(draggedLayer, topMostGroup);
        if(!sourceGroup) {
            return;
        }

        draggedLayerIdx = getLayerIndex(draggedLayer, sourceGroup);

        if (dropPosition === 'append') {
            targetGroup = droppedOnLayer;
        } else {
            targetGroup = findParentGroup(droppedOnLayer, topMostGroup);
        }

        if (targetGroup === undefined) {
            // This is effectively disallowed in beforedrop, and
            // 'should never happen'™, but …
            return;
        }

        targetLayerColl = targetGroup.getLayers();

        // remove the dragged layer from its group
        sourceGroup.getLayers().removeAt(draggedLayerIdx);

        // now determine the index of the dropped on layer, it may have changed
        droppedOnLayerIdx = getLayerIndex(droppedOnLayer, targetGroup);

        // switch the dropPosition, if the store was configured with
        // inverseLayerOrder
        if (inverseLayerOrder && dropPosition === dropPosBefore) {
            dropPosition = dropPosAfter;
        } else if (inverseLayerOrder && dropPosition === dropPosAfter) {
            dropPosition = dropPosBefore;
        }

        if (dropPosition === dropPosBefore) {
            targetIndex = droppedOnLayerIdx;
        } else if (dropPosition === dropPosAfter) {
            targetIndex = droppedOnLayerIdx + 1;
        }

        // actually insert/append the dragged layer now.
        if (targetIndex !== undefined) {
            targetLayerColl.insertAt(targetIndex, draggedLayer);
        } else {
            targetLayerColl.push(draggedLayer);
        }

        // we're done, let's continue to listen to collection events
        store.resumeCollectionEvents();
    }
});
