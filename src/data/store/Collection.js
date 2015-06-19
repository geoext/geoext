/**
 * Simple store that maps a ol.Collection to a Ext.data.Store.
 */
Ext.define('GeoExt.data.store.Collection', {
    extend: 'Ext.data.Store',
    requires: [
        'GeoExt.data.model.Object'
    ],

    /**
     * The ol collection this store syncs with.
     * @type {ol.Collection}
     *
     * @property
     */
    olCollection: null,

    model: 'GeoExt.data.model.Object',

    proxy: {
        type: 'memory',
        reader: 'json'
    },

    listeners: {
        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @inheritDoc
         */
        add: function(store, records, index) {
            var coll = store.olCollection,
                length = records.length,
                i;

            store.__updating = true;
            for (i = 0; i < length; i++) {
                coll.insertAt(index + i, records[i].olObject);
            }
            store.__updating = false;
        },

        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @inheritDoc
         */
        remove: function(store, records, index) {
            var coll = store.olCollection,
                length = records.length,
                i;

            store.__updating = true;
            for (i = 0; i < length; i++) {
                coll.removeAt(index);
            }
            store.__updating = false;
        }
    },

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

        this.olCollection.on('add', this.onOlCollectionAdd, this);
        this.olCollection.on('remove', this.onOlCollectionRemove, this);
    },

    /**
     * Forwards changes to the ol.Collection to the Ext.data.Store.
     * @param  {ol.CollectionEvent} evt
     */
    onOlCollectionAdd: function(evt) {
        var target = evt.target,
            element = evt.element,
            idx = Ext.Array.indexOf(target.getArray(), element);

        if (!this.__updating) {
            this.insert(idx, element);
        }
    },

    /**
     * Forwards changes to the ol.Collection to the Ext.data.Store.
     * @param  {ol.CollectionEvent} evt
     */
    onOlCollectionRemove: function(evt) {
        var element = evt.element,
            idx = this.findBy(function(rec) {
                return rec.olObject === element;
            });

        if (idx !== -1) {
            if (!this.__updating) {
                this.removeAt(idx);
            }
        }
    },

    /**
     * @inheritDoc
     */
    destroy: function() {
        this.olCollection.un('add', this.onCollectionAdd, this);
        this.olCollection.un('remove', this.onCollectionRemove, this);

        delete this.olCollection;

        this.callParent(arguments);
    }
});
