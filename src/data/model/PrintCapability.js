Ext.define('GeoExt.data.model.PrintCapability', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.PrintLayout'
    ],
    hasMany: [
        {
            name: 'layouts',
            associationKey: 'layouts',
            model: 'PrintLayout'
        }
    ],
    fields: [
        {
            name: 'app',
            type: 'string'
        },
        {
            name: 'formats'
        }
    ]
});
