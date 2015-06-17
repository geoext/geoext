/**
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.model.layer.Base', {
    extend: 'GeoExt.data.model.Base',

    inheritableStatics: {
        /**
         * Convenience function for creating new layer model instance object
         * using a layer object.
         *
         * @param {OpenLayers.Layer} layer
         * @return {GeoExt.data.LayerModel}
         * @static
         */
        createFromLayer: function(layer) {
            return this.getProxy().getReader().readRecords([layer]).records[0];
        }
    },
    fields: [
        {
            name: 'opacity',
            type: 'number',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Base) {
                    return layer.get('opacity');
                } else {
                    return undefined;
                }
            }
        },
        {
            name: 'visible',
            type: 'boolean',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Group) {
                    return true;
                } else if (layer instanceof ol.layer.Base) {
                    return layer.get('visible');
                } else {
                    return undefined;
                }
            }
        },
        {
            name: 'minResolution',
            type: 'number',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Base) {
                    return layer.get('minResolution');
                } else {
                    return undefined;
                }
            }
        },
        {
            name: 'maxResolution',
            type: 'number',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Base) {
                    return layer.get('maxResolution');
                } else {
                    return undefined;
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

    /**
     * Returns the {ol.layer.Base} layer object used in this model instance.
     *
     * @return {ol.layer.Base}
     */
    getOlLayer: function() {
        return this.data;
    }
});
