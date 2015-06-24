/**
 * Data model holding an OpenLayers feature.
 *
 * @class
 */
Ext.define('GeoExt.data.model.Feature', {
    extend: 'GeoExt.data.model.Object',

    /**
     * Returns the underlying Feature of this record.
     *
     * @return {ol.Feature}
     */
    getFeature: function() {
        return this.olObject;
    }

});
