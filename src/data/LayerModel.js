Ext.define('GeoExt.data.LayerModel', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'opacity', type: 'int', convert: function(v, record){
            return record.data.getOpacity();
        } },
        { name: 'visible', type: 'boolean', convert: function(v, record){
            return record.data.getVisible();
        } },
        { name: 'minResolution', type: 'auto', convert: function(v, record){
            return record.data.getMinResolution();
        } },
        { name: 'maxResolution', type: 'auto', convert: function(v, record){
            return record.data.getMaxResolution();
        } }
    ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    /**
     * Returns the {ol.layer.Layer} layer object used in this model instance.
     *
     * @return {ol.layer.Layer}
     */
    getLayer: function() {
        return this.data;
    }
});
