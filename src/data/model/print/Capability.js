Ext.define('GeoExt.data.model.print.Capability', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.print.Layout'
    ],
    hasMany: [
        {
            name: 'layouts',
            associationKey: 'layouts',
            model: 'print.Layout'
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
