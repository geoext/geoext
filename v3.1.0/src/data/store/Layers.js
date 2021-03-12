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
 * A store that synchronizes a layers array of an OpenLayers.Map with a
 * layer store holding GeoExt.data.model.layer.Base instances.
 *
 * @class GeoExt.data.store.Layers
 */
Ext.define('GeoExt.data.store.Layers', {
    extend: 'Ext.data.Store',
    alternateClassName: ['GeoExt.data.LayerStore'],
    requires: [
        'GeoExt.data.model.Layer'
    ],

    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.Collection#clear',
        'ol.Collection#forEach',
        'ol.Collection#getArray',
        'ol.Collection#insertAt',
        'ol.Collection#on',
        'ol.Collection#push',
        'ol.Collection#remove',
        'ol.layer.Layer',
        'ol.layer.Layer#get',
        'ol.layer.Layer#on',
        'ol.layer.Layer#set',
        'ol.Map',
        'ol.Map#getLayers'
    ],
    // </debug>

    model: 'GeoExt.data.model.Layer',

    config: {
        /**
         * A configured map or a configuration object for the map constructor.
         *
         * @cfg {ol.Map/Object} map
         */
        map: null
    },

    /**
     * Constructs an instance of the layer store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        var me = this;

        me.callParent([config]);

        if (config.map) {
            this.bindMap(config.map);
        }
    },

    /**
     * Bind this store to a map instance; once bound, the store is synchronized
     * with the map and vice-versa.
     *
     * @param {ol.Map} map The map instance.
     */
    bindMap: function(map) {
        var me = this;

        if (!me.map) {
            me.map = map;
        }

        if (map instanceof ol.Map) {
            var mapLayers = map.getLayers();
            mapLayers.forEach(function(layer) {
                me.loadRawData(layer, true);
            });

            mapLayers.forEach(function(layer) {
                layer.on('propertychange', me.onChangeLayer, me);
            });
            mapLayers.on('add', me.onAddLayer, me);
            mapLayers.on('remove', me.onRemoveLayer, me);
        }

        me.on({
            'load': me.onLoad,
            'clear': me.onClear,
            'add': me.onAdd,
            'remove': me.onRemove,
            'update': me.onStoreUpdate,
            'scope': me
        });

        me.data.on({
            'replace': me.onReplace,
            'scope': me
        });
        me.fireEvent('bind', me, map);
    },

    /**
     * Unbind this store from the map it is currently bound.
     */
    unbindMap: function() {
        var me = this;

        if (me.map && me.map.getLayers()) {
            me.map.getLayers().un('add', me.onAddLayer, me);
            me.map.getLayers().un('remove', me.onRemoveLayer, me);
        }
        me.un('load', me.onLoad, me);
        me.un('clear', me.onClear, me);
        me.un('add', me.onAdd, me);
        me.un('remove', me.onRemove, me);
        me.un('update', me.onStoreUpdate, me);

        me.data.un('replace', me.onReplace, me);

        me.map = null;
    },

    /**
     * Handler for layer changes. When layer order changes, this moves the
     * appropriate record within the store.
     *
     * @param {ol.ObjectEvent} evt The emitted `ol.Object` event.
     * @private
     */
    onChangeLayer: function(evt) {
        var layer = evt.target;
        var recordIndex = this.findBy(function(rec) {
            return rec.getOlLayer() === layer;
        });
        if (recordIndex > -1) {
            var record = this.getAt(recordIndex);
            if (evt.key === 'title') {
                record.set('title', layer.get('title'));
            } else {
                this.fireEvent('update', this, record, Ext.data.Record.EDIT);
            }
        }
    },

    /**
     * Handler for a layer collection's `add` event.
     *
     * @param {ol.CollectionEvent} evt The emitted `ol.Collection` event.
     * @private
     */
    onAddLayer: function(evt) {
        var layer = evt.element;
        var index = this.map.getLayers().getArray().indexOf(layer);
        var me = this;
        layer.on('propertychange', me.onChangeLayer, me);
        if (!me._adding) {
            me._adding = true;
            var result = me.proxy.reader.read(layer);
            me.insert(index, result.records);
            delete me._adding;
        }
    },

    /**
     * Handler for layer collection's `remove` event.
     *
     * @param {ol.CollectionEvent} evt The emitted `ol.Collection` event.
     * @private
     */
    onRemoveLayer: function(evt) {
        var me = this;
        if (!me._removing) {
            var layer = evt.element;
            var rec = me.getByLayer(layer);
            if (rec) {
                me._removing = true;
                layer.un('propertychange', me.onChangeLayer, me);
                me.remove(rec);
                delete me._removing;
            }
        }
    },

    /**
     * Handler for a store's `load` event.
     *
     * @param {Ext.data.Store} store The store that loaded.
     * @param {Ext.data.Model[]} records An array of loades model instances.
     * @param {Boolean} successful Whether loading was successful or not.
     * @private
     */
    onLoad: function(store, records, successful) {
        var me = this;
        if (successful) {
            if (!Ext.isArray(records)) {
                records = [records];
            }
            if (!me._addRecords) {
                me._removing = true;
                me.map.getLayers().forEach(function(layer) {
                    layer.un('propertychange', me.onChangeLayer, me);
                });
                me.map.getLayers().clear();
                delete me._removing;
            }
            var len = records.length;
            if (len > 0) {
                var layers = new Array(len);
                for (var i = 0; i < len; i++) {
                    layers[i] = records[i].getOlLayer();
                    layers[i].on('propertychange', me.onChangeLayer, me);
                }
                me._adding = true;
                me.map.getLayers().extend(layers);
                delete me._adding;
            }
        }
        delete me._addRecords;
    },

    /**
     * Handler for a store's `clear` event.
     *
     * @private
     */
    onClear: function() {
        var me = this;
        me._removing = true;
        me.map.getLayers().forEach(function(layer) {
            layer.un('propertychange', me.onChangeLayer, me);
        });
        me.map.getLayers().clear();
        delete me._removing;
    },

    /**
     * Handler for a store's `add` event.
     *
     * @param {Ext.data.Store} store The store to which a model instance was
     *     added.
     * @param {Ext.data.Model[]} records The array of model instances that were
     *     added.
     * @param {Number} index The index at which the model instances were added.
     * @private
     */
    onAdd: function(store, records, index) {
        var me = this;
        if (!me._adding) {
            me._adding = true;
            var layer;
            for (var i = 0, ii = records.length; i < ii; ++i) {
                layer = records[i].getOlLayer();
                layer.on('propertychange', me.onChangeLayer, me);
                if (index === 0) {
                    me.map.getLayers().push(layer);
                } else {
                    me.map.getLayers().insertAt(index, layer);
                }
            }
            delete me._adding;
        }
    },

    /**
     * Handler for a store's `remove` event.
     *
     * @param {Ext.data.Store} store The store from which a model instances
     *     were removed.
     * @param {Ext.data.Model[]} records The array of model instances that were
     *     removed.
     * @private
     */
    onRemove: function(store, records) {
        var me = this;
        var record;
        var layer;
        var found;
        var i;
        var ii;

        if (!me._removing) {
            var compareFunc = function(el) {
                if (el === layer) {
                    found = true;
                }
            };
            for (i = 0, ii = records.length; i < ii; ++i) {
                record = records[i];
                layer = record.getOlLayer();
                found = false;
                layer.un('propertychange', me.onChangeLayer, me);
                me.map.getLayers().forEach(compareFunc);
                if (found) {
                    me._removing = true;
                    me.removeMapLayer(record);
                    delete me._removing;
                }
            }
        }
    },

    /**
     * Handler for a store's `update` event.
     *
     * @param {Ext.data.Store} store The store which was updated.
     * @param {Ext.data.Model} record The model instance that was updated.
     * @param {String} operation The operation, either Ext.data.Model.EDIT,
     *     Ext.data.Model.REJECT or Ext.data.Model.COMMIT.
     * @private
     */
    onStoreUpdate: function(store, record, operation) {
        if (operation === Ext.data.Record.EDIT) {
            if (record.modified && record.modified.title) {
                var layer = record.getOlLayer();
                var title = record.get('title');
                if (title !== layer.get('title')) {
                    layer.set('title', title);
                }
            }
        }
    },

    /**
     * Removes a record's layer from the bound map.
     *
     * @param {Ext.data.Model} record The removed model instance.
     * @private
     */
    removeMapLayer: function(record) {
        this.map.getLayers().remove(record.getOlLayer());
    },

    /**
     * Handler for a store's data collections' `replace` event.
     *
     * @param {String} key The associated key.
     * @param {Ext.data.Model} oldRecord In this case, a record that has
     *     been replaced.
     * @private
     */
    onReplace: function(key, oldRecord) {
        this.removeMapLayer(oldRecord);
    },

    /**
     * Get the record for the specified layer.
     *
     * @param {ol.layer.Base} layer The layer to get a model instance for.
     * @return {Ext.data.Model} The corresponding model instance or undefined if
     *     not found.
     */
    getByLayer: function(layer) {
        var index = this.findBy(function(r) {
            return r.getOlLayer() === layer;
        });
        if (index > -1) {
            return this.getAt(index);
        }
    },

    /**
     * Unbinds listeners by calling #unbind prior to being destroyed.
     *
     * @private
     */
    destroy: function() {
        this.unbind();
        this.callParent();
    },

    /**
     * Overload loadRecords to set a flag if `addRecords` is `true` in the load
     * options. ExtJS does not pass the load options to "load" callbacks, so
     * this is how we provide that information to `onLoad`.
     *
     * @param {Ext.data.Model[]} records The array of records to load.
     * @param {Object} options The loading options.
     * @param {Boolean} [options.addRecords=false] Pass `true` to add these
     *     records to the existing records, `false` to remove the Store's
     *     existing records first.
     * @private
     */
    loadRecords: function(records, options) {
        if (options && options.addRecords) {
            this._addRecords = true;
        }
        this.callParent(arguments);
    },

    /**
     * @inheritdoc
     *
     * The event firing behaviour of Ext.4.1 is reestablished here. See also:
     * [This discussion on the Sencha forum](http://www.sencha.com/forum/
     * showthread.php?253596-beforeload-is-not-fired-by-loadRawData).
     */
    loadRawData: function(data, append) {
        var me = this;
        var result = me.proxy.reader.read(data);
        var records = result.records;

        if (result.success) {
            me.totalCount = result.total;
            me.loadRecords(records, append ? me.addRecordsOptions : undefined);
            me.fireEvent('load', me, records, true);
        }
    }

});
