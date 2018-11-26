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
 * The layer tree node class used by the stores used in trees.
 *
 * @class GeoExt.data.model.LayerTreeNode
 */
Ext.define('GeoExt.data.model.LayerTreeNode', {
    extend: 'GeoExt.data.model.Layer',
    requires: [
        'Ext.data.NodeInterface'
    ],
    mixins: [
        'Ext.mixin.Queryable',
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.layer.Base',
        'ol.Object#get',
        'ol.Object#set'
    ],
    // </debug>

    fields: [{
        name: 'leaf',
        type: 'boolean',
        convert: function(v, record) {
            var isGroup = record.get('isLayerGroup');
            if (isGroup === undefined || isGroup) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        /**
         * This should be set via tree panel.
         */
        name: '__toggleMode',
        type: 'string',
        defaultValue: 'classic'
    }, {
        name: 'iconCls',
        type: 'string',
        convert: function(v, record) {
            return record.getOlLayerProp('iconCls');
        }
    }],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    /**
     * @inheritDoc
     */
    constructor: function() {
        var layer;

        this.callParent(arguments);

        layer = this.getOlLayer();
        if (layer instanceof ol.layer.Base) {
            this.set('checked', layer.get('visible'));
            layer.on('change:visible', this.onLayerVisibleChange, this);
        }
    },

    /**
     * Handler for the `change:visible` event of the layer.
     *
     * @param {ol.ObjectEvent} evt The emitted `ol.Object` event.
     */
    onLayerVisibleChange: function(evt) {
        var target = evt.target;

        if (!this.__updating) {
            this.set('checked', target.get('visible'));
        }
    },

    /**
     * Overriden to forward changes to the underlying `ol.Object`. All changes
     * on the {Ext.data.Model} properties will be set on the `ol.Object` as
     * well.
     *
     * @param {String} key The key to set.
     * @param {Object} newValue The value to set.
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
        var me = this;
        var classicMode = (me.get('__toggleMode') === 'classic');

        me.callParent(arguments);

        // forward changes to ol object
        if (key === 'checked') {
            me.__updating = true;
            if (me.get('isLayerGroup') && classicMode) {
                me.getOlLayer().set('visible', newValue);
                if (me.childNodes) {
                    me.eachChild(function(child) {
                        child.getOlLayer().set('visible', newValue);
                    });
                }
            } else {
                me.getOlLayer().set('visible', newValue);
            }
            me.__updating = false;

            if (classicMode) {
                me.toggleParentNodes(newValue);
            }
        }
    },

    /**
     * Handles parent behaviour of checked nodes: Checks parent Nodes if node
     * is checked or unchecks parent nodes if the node is unchecked and no
     * sibling is checked.
     *
     * @param {Boolean} newValue The newValue to pass through to the parent.
     * @private
     */
    toggleParentNodes: function(newValue) {
        var me = this;
        // Checks parent Nodes if node is checked.
        if (newValue === true) {
            me.__updating = true;
            me.bubble(function(parent) {
                if (!parent.isRoot()) {
                    parent.set('__toggleMode', 'ol3'); // prevents recursion
                    parent.set('checked', true);
                    parent.set('__toggleMode', 'classic');
                }
            });
            me.__updating = false;
        }

        // Unchecks parent Nodes if the node is unchecked and no sibling is
        // checked.
        if (newValue === false) {
            me.__updating = true;
            me.bubble(function(parent) {
                if (!parent.isRoot()) {
                    var allUnchecked = true;
                    parent.eachChild(function(child) {
                        if (child.get('checked')) {
                            allUnchecked = false;
                        }
                    });
                    if (allUnchecked) {
                        parent.set('__toggleMode', 'ol3'); // prevents recursion
                        parent.set('checked', false);
                        parent.set('__toggleMode', 'classic');
                    }
                }
            });
            me.__updating = false;
        }
    },

    /**
     * @inheritdoc
     */
    getRefItems: function() {
        return this.childNodes;
    },

    /**
     * @inheritdoc
     */
    getRefOwner: function() {
        return this.parentNode;
    }

}, function() {
    // make this an Ext.data.TreeModel
    Ext.data.NodeInterface.decorate(this);
});
