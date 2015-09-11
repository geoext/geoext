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
 * The layer model class used by the stores.
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

    fields: [
        {
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
        }
    ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    /**
     * TODO
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
     * TODO
     */
    onLayerVisibleChange: function(evt) {
        var target = evt.target;

        if (!this.__updating) {
            this.set('checked', target.get('visible'));
        }
    },

    /**
     * Overriden to foward changes to the underlying ol.Object. All changes on
     * the Ext.data.Models properties will be set on the ol.Object as well.
     *
     * @param {String} key
     * @param {Object} value
     * @param {Object} options
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
        var me = this;
        me.callParent(arguments);

        // forward changes to ol object
        if (key === 'checked') {
            me.__updating = true;
            if(me.get('isLayerGroup') && me.get('__toggleMode') === 'classic'){
                me.getOlLayer().set('visible', newValue);
                if(me.childNodes){
                    me.eachChild(function(child){
                        child.getOlLayer().set('visible', newValue);
                    });
                }
            } else {
                me.getOlLayer().set('visible', newValue);
            }
            me.__updating = false;

            if(me.get('__toggleMode') === 'classic'){
                me.toggleParentNodes(newValue);
            }
        }
    },

    /**
     * Handles Parentbehaviour of checked Nodes:
     * Checks parent Nodes if node is checked or unchecks parent Nodes if the
     * node is unchecked and no sibling is checked.
     * @private
     * @param {Boolean} newValue
     */
    toggleParentNodes: function(newValue){
        var me = this;
        // Checks parent Nodes if node is checked.
        if(newValue === true){
            me.__updating = true;
            me.bubble(function(parent){
                if(!parent.isRoot()){
                    parent.set('__toggleMode', 'ol3'); // prevents recursion
                    parent.set('checked', true);
                    parent.set('__toggleMode', 'classic');
                }
            });
            me.__updating = false;
        }

        // Unchecks parent Nodes if the node is unchecked and no sibling is
        // checked.
        if(newValue === false){
            me.__updating = true;
            me.bubble(function(parent){
                if(!parent.isRoot()){
                    var allUnchecked = true;
                    parent.eachChild(function(child){
                        if(child.get('checked')){
                            allUnchecked = false;
                        }
                    });
                    if (allUnchecked){
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

}, function () {
    // make this an Ext.data.TreeModel
    Ext.data.NodeInterface.decorate(this);
});
