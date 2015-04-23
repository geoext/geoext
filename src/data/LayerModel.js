Ext.define('GeoExt.data.LayerModel', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'opacity', type: 'int', convert: function(v, record){
            return record.data.leaf ? record.data.getOpacity() : false;
        } },
        { name: 'visible', type: 'boolean', convert: function(v, record){
            return record.data.leaf ? record.data.getVisible() : true;
        } },
        { name: 'minResolution', type: 'auto', convert: function(v, record){
            return record.data.leaf ? record.data.getMinResolution() : false;
        } },
        { name: 'maxResolution', type: 'auto', convert: function(v, record){
            return record.data.leaf ? record.data.getMaxResolution() : false;
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
