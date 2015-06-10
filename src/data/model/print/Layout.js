Ext.define('GeoExt.data.model.print.Layout', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.print.LayoutAttributes'
    ],
    hasMany: [
        {
            name: 'attributes',
            associationKey: 'attributes',
            model: 'print.LayoutAttributes'
        }
    ],
    fields: [
        {
            name: 'name',
            type: 'string'
        }
    ]
});
