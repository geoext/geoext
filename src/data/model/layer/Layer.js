/**
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.model.layer.Layer', {
    extend: 'GeoExt.data.model.layer.Base',

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    fields: [{
        name: 'source',
        type: 'auto',
        convert: function(v, record){
            var layer = record.getOlLayer();
            if (layer instanceof ol.layer.Layer) {
                return layer.getSource();
            } else {
                return undefined;
            }
        }
    }]
});
