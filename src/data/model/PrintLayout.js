Ext.define('GeoExt.data.model.PrintLayout', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.PrintLayoutAttributes'
    ],
    hasMany: [
        {
            name: 'attributes',
            associationKey: 'attributes',
            model: 'PrintLayoutAttributes'
        }
    ],
    fields: [
        {
            name: 'name',
            type: 'string'
        }
    ]
});