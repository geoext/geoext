Ext.define('GeoExt.data.LayerModel', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'opacity', type: 'int' },
        { name: 'visible', type: 'boolean' },
        { name: 'extent', type: 'auto' },
        { name: 'minResolution', type: 'int' },
        { name: 'maxResolution', type: 'int' }
    ],

    /**
     * Returns the {ol.layer.Layer} layer object used in this model instance.
     *
     * @return {ol.layer.Layer}
     */
    getLayer: function() {
        return this.data;
    }
});
