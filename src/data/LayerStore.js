Ext.define('GeoExt.data.LayerStore', {
    extend: 'Ext.data.Store',
    requires: ['GeoExt.data.LayerModel'],
    model: 'GeoExt.data.LayerModel',

    constructor: function(config) {
        var me = this;

        me.callParent([config]);

        if(config.map) {
            this.bindMap(config.map);
        }
    },

    /**
     *
     */
    bindMap: function(map){
        var me = this;

        if(!me.map) {
            me.map = map;
        }

        //TODO 1. Bring LayerModel in line
        /*
         * Bind Layers from map to Store if we have an ol.Map object
         */
        if(map instanceof ol.Map){
            var mapLayers = map.getLayers();
            mapLayers.forEach(function(layer, index, array){
                me.add(layer);
            });
        } else {
            Ext.Error.raise('No ol.Map is provided to the MapPanel');
        }

        //TODO 2. bind events from collection to store
        mapLayers.forEach(function(layer) {
            layer.on('propertychange', me.onChangeLayer, me);
        });
        mapLayers.on('add', me.onAddLayer, me);
        mapLayers.on('remove', me.onRemoveLayer, me);

        //TODO 3. bind store events to collection
        me.on({
            "load": me.onLoad,
            "clear": me.onClear,
            "add": me.onAdd,
            "remove": me.onRemove,
            "update": me.onStoreUpdate,
            scope: me
        });

        me.data.on({
            "replace" : me.onReplace,
            scope: me
        });
        me.fireEvent("bind", me, map);
    },

    /**
     *
     */
    unbindMap: function() {
        var me = this;

        if (me.map && me.map.getLayers()) {
            me.map.getLayers().un('add', me.onAddLayer, me);
            me.map.getLayers().un('remove', me.onRemoveLayer, me);
        }
        me.un("load", me.onLoad, me);
        me.un("clear", me.onClear, me);
        me.un("add", me.onAdd, me);
        me.un("remove", me.onRemove, me);
        me.un("update", me.onStoreUpdate, me);

        me.data.un("replace", me.onReplace, me);

        me.map = null;
    },

    /**
     * Handler for layer changes.  When layer order changes, this moves the
     * appropriate record within the store.
     *
     * @param {Object} evt
     * @private
     */
    onChangeLayer: function(evt) {
        var layer = evt.target;
        var recordIndex = this.findBy(function(rec, id) {
            return rec.getLayer() === layer;
        });
        if(recordIndex > -1) {
            var record = this.getAt(recordIndex);
            if (evt.key === "title") {
                record.set("title", layer.get('title'));
            } else {
                this.fireEvent("update", this, record, Ext.data.Record.EDIT);
            }
        }
    },

    /**
     * Handler for a layer collection's add event.
     *
     * @param {Object} evt
     * @private
     */
    onAddLayer: function(evt) {
        var layer = evt.element;
        var index = this.map.getLayers().getArray().indexOf(layer);
        var me = this;
        layer.on('propertychange', me.onChangeLayer, me);
        if(!me._adding) {
            me._adding = true;
            var result  = me.proxy.reader.read(layer);
            me.insert(index, result.records);
            delete me._adding;
        }
    },

    /**
     * Handler for layer collection's remove event.
     *
     * @param {Object} evt
     * @private
     */
    onRemoveLayer: function(evt){
        var me = this;
        if(!me._removing) {
            var layer = evt.element,
                rec = me.getByLayer(layer);
            if (rec) {
                me._removing = true;
                layer.un('propertychange', me.onChangeLayer, me);
                me.remove(rec);
                delete me._removing;
            }
        }
    },

    /**
     * Handler for a store's load event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model[]} records
     * @param {Boolean} successful
     * @private
     */
    onLoad: function(store, records, successful) {
        if (successful) {
            var me = this;
            if (!Ext.isArray(records)) {
                records = [records];
            }
            if(!me._addRecords) {
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
                    layers[i] = records[i].getLayer();
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
     * Handler for a store's clear event.
     *
     * @param {Ext.data.Store} store
     * @private
     */
    onClear: function(store) {
        var me = this;
        me._removing = true;
        me.map.getLayers().forEach(function(layer) {
            layer.un('propertychange', me.onChangeLayer, me);
        });
        me.map.getLayers().clear();
        delete me._removing;
    },

    /**
     * Handler for a store's add event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model[]} records
     * @param {Number} index
     * @private
     */
    onAdd: function(store, records, index) {
        var me = this;
        if (!me._adding) {
            me._adding = true;
            var layer;
            for (var i=0, ii=records.length; i<ii; ++i) {
                layer = records[i].getLayer();
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
     * Handler for a store's remove event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model} record
     * @param {Number} index
     * @private
     */
    onRemove: function(store, record, index){
        var me = this;
        if(!me._removing) {
            var layer = record.getLayer();
            layer.un('propertychange', me.onChangeLayer, me);
            var found = false;
            me.map.getLayers().forEach(function(el) {
                if (el === layer) {
                    found = true;
                }
            });
            if (found) {
                me._removing = true;
                me.removeMapLayer(record);
                delete me._removing;
            }
        }
    },

    /**
     * Handler for a store's update event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model} record
     * @param {Number} operation
     */
    onStoreUpdate: function(store, record, operation) {
        if(operation === Ext.data.Record.EDIT) {
            if (record.modified && record.modified.title) {
                var layer = record.getLayer();
                var title = record.get("title");
                if(title !== layer.get('title')) {
                    layer.set('title', title);
                }
            }
        }
    },

    /**
     * Removes a record's layer from the bound map.
     *
     * @param {Ext.data.Record} record
     * @private
     */
    removeMapLayer: function(record){
        this.map.getLayers().remove(record.getLayer());
    },

    /**
     * Handler for a store's data collections' replace event.
     *
     * @param {String} key
     * @param {Ext.data.Model} oldRecord In this case, a record that has
     *     been replaced.
     * @param {Ext.data.Model} newRecord In this case, a record that is
     *     replacing oldRecord.
     * @private
     */
    onReplace: function(key, oldRecord, newRecord){
        this.removeMapLayer(oldRecord);
    },

    /**
     * Get the record for the specified layer.
     *
     * @param {OpenLayers.Layer} layer
     * @returns {Ext.data.Model} or undefined if not found
     */
    getByLayer: function(layer) {
        var index = this.findBy(function(r) {
            return r.getLayer() === layer;
        });
        if(index > -1) {
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
     * Overload loadRecords to set a flag if `addRecords` is `true`
     * in the load options. Ext JS does not pass the load options to
     * "load" callbacks, so this is how we provide that information
     * to `onLoad`.
     *
     * @private
     */
    loadRecords: function(records, options) {
        if(options && options.addRecords) {
            this._addRecords = true;
        }
        this.callParent(arguments);
    },

    /**
     * @inheritdoc
     *
     * The event firing behaviour of Ext.4.1 is reestablished here. See also:
     * [This discussion on the Sencha forum](http://www.sencha.com/forum/
     * showthread.php?253596-beforeload-is-not-fired-by-loadRawData)
     *
     * In version 4.2.1 this method reads
     *
     *     //...
     *     loadRawData : function(data, append) {
     *         var me      = this,
     *             result  = me.proxy.reader.read(data),
     *             records = result.records;
     *
     *         if (result.success) {
     *             me.totalCount = result.total;
     *             me.loadRecords(records, append ? me.addRecordsOptions : undefined);
     *         }
     *     },
     *     // ...
     *
     * While the previous version 4.1.3 has also
     * the line `me.fireEvent('load', me, records, true);`:
     *
     *     // ...
     *     if (result.success) {
     *         me.totalCount = result.total;
     *         me.loadRecords(records, append ? me.addRecordsOptions : undefined);
     *         me.fireEvent('load', me, records, true);
     *     }
     *     // ...
     *
     * Our overwritten method has the code from 4.1.3, so that the #load-event
     * is being fired.
     *
     * See also the source code of [version 4.1.3](http://docs-origin.sencha.
     * com/extjs/4.1.3/source/Store.html#Ext-data-Store-method-loadRawData) and
     * of [version 4.2.1](http://docs-origin.sencha.com/extjs/4.2.1/source/
     * Store.html#Ext-data-Store-method-loadRawData).
     */
    loadRawData : function(data, append) {
        var me      = this,
            result  = me.proxy.reader.read(data),
            records = result.records;

        if (result.success) {
            me.totalCount = result.total;
            me.loadRecords(records, append ? me.addRecordsOptions : undefined);
            me.fireEvent('load', me, records, true);
        }
    }

});