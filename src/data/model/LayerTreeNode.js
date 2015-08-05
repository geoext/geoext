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
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.model.LayerTreeNode', {
    extend: 'GeoExt.data.model.Layer',
    requires: [
        'Ext.data.NodeInterface'
    ],

    mixins: [
        'Ext.mixin.Queryable'
    ],

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
        }
    ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    constructor: function() {
        var layer;

        this.callParent(arguments);

        layer = this.getOlLayer();
        if (layer instanceof ol.layer.Base) {
            this.set('checked', layer.get('visible'));
            layer.on('change:visible', this.onLayerVisibleChange, this);
        }
    },

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
     * @inheritDoc
     */
    set: function(key, newValue) {
        this.callParent(arguments);

        // forward changes to ol object
        if (key === 'checked') {
            this.__updating = true;
            this.getOlLayer().set('visible', newValue);
            this.__updating = false;
        }
    },

    /**
     * @inheritDoc
     */
    getRefItems: function() {
        return this.childNodes;
    },

    /**
     * @inheritDoc
     */
    getRefOwner: function() {
        return this.parentNode;
    }

}, function () {
    // make this an Ext.data.TreeModel
    Ext.data.NodeInterface.decorate(this);
});
