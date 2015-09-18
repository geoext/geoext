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
 * Simple model that maps an ol.Object to an Ext.data.Model.
 *
 * @class GeoExt.data.model.OlObject
 */
Ext.define('GeoExt.data.model.OlObject', {
    extend: 'GeoExt.data.model.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol',
        'ol.Object',
        'ol.Object#on',
        'ol.Object#get',
        'ol.Object#set'
    ],
    // </debug>

    statics: {
        /**
         * Gets a reference to an ol contructor function.
         *
         * @param {String} str Description of the form "ol.layer.Base"
         * @return {Function} the ol constructor
         */
        getOlCLassRef: function(str) {
            var ref = ol,
                members;

            if (Ext.isString(str)) {
                members = str.split('.');
                // shift if description contains namespace
                if (Ext.Array.indexOf(members, 'ol') === 0) {
                    members.shift();
                }
                // traverse namespace to ref
                Ext.Array.each(members, function(member) {
                    ref = ref[member];
                });
            }

            return ref;
        }
    },

    /**
     * String description of the reference path to the wrapped ol class.
     *
     * @property {String}
     */
    olClass: 'ol.Object',

    /**
     * The underlying ol.Object
     *
     * @property {ol.Object}
     */
    olObject: null,

    proxy: {
        type: 'memory',
        reader: 'json'
    },

    /**
     * @inheritdoc
     */
    constructor: function(data) {
        var me = this,
            statics = this.statics(),
            OlClass = statics.getOlCLassRef(this.olClass);

        data = data || {};

        // init ol object if plain data is handed over
        if (!(data instanceof OlClass)) {
            data = new OlClass(data);
        }

        me.olObject = data;

        // init record with properties of underlying ol object
        me.callParent([this.olObject.getProperties()]);

        me.olObject.on('propertychange', me.onPropertychange, me);
    },

    /**
     * Listener to propertychange events of the underlying ol.Object.
     * All changes on the object will be forwarded to the Ext.data.Model.
     *
     * @param  {ol.ObjectEvent} evt
     *
     * @private
     */
    onPropertychange: function(evt) {
        var target = evt.target,
            key = evt.key;

        if (!this.__updating) {
            this.set(key, target.get(key));
        }
    },

    /**
     * Overriden to foward changes to the underlying ol.Object. All changes on
     * the Ext.data.Models properties will be set on the ol.Object as well.
     *
     * @param {String|Object} key
     * @param {Object} value
     * @param {Object} options
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
        var o = {};

        this.callParent(arguments);

        // forward changes to ol object
        this.__updating = true;

        // wrap simple set operations into an object
        if (Ext.isString(key)) {
            o[key] = newValue;
        } else {
            o = key;
        }

        // iterate over object setting changes to ol.Object
        Ext.Object.each(o, function(k, v) {
            this.olObject.set(k, v);
        }, this);

        this.__updating = false;
    },

    /**
     * Overriden to un all added event listeners on the ol.Object.
     *
     * @inheritdoc
     */
    destroy: function() {
        this.olObject.un('propertychange', this.onPropertychange, this);

        this.callParent(arguments);
    }
});
