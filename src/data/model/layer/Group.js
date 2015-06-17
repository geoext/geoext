/**
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.model.layer.Group', {
    extend: 'GeoExt.data.model.layer.Base',

    hasMany: [ {
       name: 'layer',
       associationKey: 'gxLayers',
       model: 'layer.Base'
    } ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            transform: {
                fn: function(groupLayers) {
                    Ext.each(groupLayers, function(groupLayer) {
                        groupLayer.gxLayers = groupLayer.getLayers().getArray();
                    });
                    return groupLayers;
                }
            }
        }
    },

    fields: [
        {
            type: 'auto',
            name: 'gxLayers'
        }
    ]

//    /**
//     * Returns the {ol.Collection} containing the layer {ol.layer.Base} objects.
//     *
//     * @return {ol.Collection}
//     */
//    getLayers: function() {
//        return this.getLayer().getLayers();
//    }
});
