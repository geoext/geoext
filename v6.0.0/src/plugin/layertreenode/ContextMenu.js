/* Copyright (c) 2015-present The Open Source Geospatial Foundation
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
 * (Abstract) plugin for an Ext.tree.Column used in an layer tree in order to
 * render a custom UI component on right-click of a LayerTreeNode, e. g. a menu
 * (like `Ext.menu.Menu`).
 *
 * The UI creation can be adapted by overwriting the #createContextUi
 * function.
 *
 * @class GeoExt.plugin.layertreenode.ContextMenu
 */
Ext.define('GeoExt.plugin.layertreenode.ContextMenu', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.gx_layertreenode_contextmenu',

    /**
     * The UI component to be rendered when the LayerTreeNode is right clicked.
     *
     * @property {Ext.Component}
     */
    contextUi: null,

    /**
     * Flag to steer whether the #contextUi should be destroyed and re-created
     * every time the LayerTreeNode is right clicked.
     *
     * @cfg {Boolean}
     */
    recreateContextUi: true,

    /**
     * Initializes this plugin.
     *
     * @param  {Ext.tree.Column} treeColumn [description]
     * @private
     */
    init: function(treeColumn) {
        var me = this;
        if (!(treeColumn instanceof Ext.tree.Column)) {
            Ext.log.warn('Plugin shall only be applied to instances of' +
                    ' Ext.tree.Column');
            return;
        }

        treeColumn.on('contextmenu', me.onContextMenu, me);
    },

    /**
     * Handles the 'contextmenu' event of the connected Ext.tree.Column.
     * Creates the UI by #createContextUi and shows the UI by #showContextUi.
     *
     * @param  {Ext.view.Table}  treeView The tree table view
     * @param  {HTMLElement}     td       The TD element for the cell.
     * @param  {Number}          rowIdx   Index of the row
     * @param  {Number}          colIdx   Index of the column
     * @param  {Ext.event.Event} evt      The original event object
     * @param  {GeoExt.data.model.LayerTreeNode} layerTreeNode
     *     LayerTreeNode holding the OL layer
     * @private
     */
    onContextMenu: function(treeView, td, rowIdx, colIdx, evt, layerTreeNode) {
        var me = this;
        evt.preventDefault();

        if (me.contextUi && me.recreateContextUi) {
            me.contextUi.destroy();
            me.contextUi = null;
        }

        if (!me.contextUi) {
            me.contextUi = me.createContextUi(layerTreeNode);
        }

        me.showContextUi(evt.getXY());
    },

    /**
     * Creates and returns the context UI, which is rendered when the
     * LayerTreeNode is right clicked.
     * Should be overwritten by concrete implementation of this plugin.
     *
     * @param  {GeoExt.data.model.LayerTreeNode} layerTreeNode
     *     LayerTreeNode holding the OL layer
     * @return {Ext.Component} The UI component to be shown on layer right-click
     */
    createContextUi: function(layerTreeNode) {
        Ext.Logger.warn('gx_layertreenode_contextmenu: createContextUi is ' +
            'not overwritten. It is very likely that the plugin won\'t work');
        return null;
    },

    /**
     * Shows the context UI.
     * Can be overwritten by concrete implementation of this plugin.
     * Default shows the #contextUi at the position where the right-click was
     * performed.
     *
     * @param  {Number[]} clickPos The pixel position of the right-click
     */
    showContextUi: function(clickPos) {
        var me = this;
        if (me.contextUi && clickPos) {
            me.contextUi.showAt(clickPos);
        }
    }
});
