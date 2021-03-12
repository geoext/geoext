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
 * Simple store that maps a ol.Collection to a Ext.data.Store.
 *
 * @class GeoExt.data.store.OlObjects
 */
Ext.define('GeoExt.data.store.OlObjects', {
    extend: 'Ext.data.Store',
    requires: [
        'GeoExt.data.model.OlObject'
    ],

    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.Collection',
        'ol.Collection#getArray',
        'ol.Collection#insertAt',
        'ol.Collection#removeAt'
    ],
    // </debug>

    /**
     * The ol collection this store syncs with.
     *
     * @property {ol.Collection}
     */
    olCollection: null,

    model: 'GeoExt.data.model.OlObject',

    proxy: {
        type: 'memory',
        reader: 'json'
    },

    listeners: {
        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @private
         * @inheritdoc
         */
        add: function(store, records, index) {
            var coll = store.olCollection;
            var length = records.length;
            var i;

            store.__updating = true;
            for (i = 0; i < length; i++) {
                if (!Ext.Array.contains(
                    store.olCollection.getArray(),
                    records[i].olObject)
                ) {
                    coll.insertAt(index + i, records[i].olObject);
                }
            }
            store.__updating = false;
        },

        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @private
         * @inheritdoc
         */
        remove: function(store, records, index) {
            var coll = store.olCollection;

            store.__updating = true;
            Ext.each(records, function(rec) {
                coll.remove(rec.olObject);
            });
            store.__updating = false;
        }
    },

    /**
     * Constructs a new OlObjects store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        config = config || {};

        // cache ol.Collection on property
        if (config.data instanceof ol.Collection) {
            this.olCollection = config.data;
        // init ol.Collection if array is provided
        } else {
            this.olCollection = new ol.Collection(config.data || []);
        }
        delete config.data;

        config.data = this.olCollection.getArray();

        this.callParent([config]);
    },

    /**
     * @inheritdoc
     */
    destroy: function() {
        delete this.olCollection;

        this.callParent(arguments);
    }
});
