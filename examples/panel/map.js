Ext.require([
    'GeoExt.panel.Map'
]);

var olMap,
    mapPanel;

Ext.application({
    name: 'MapPanel',
    launch: function(){
        var description;

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.Stamen({
                        layer: 'watercolor'
                    })
                }),
                new ol.layer.Tile({
                    source: new ol.source.Stamen({
                        layer: 'terrain-labels'
                    })
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat( [-122.416667, 37.783333] ),
                zoom: 12
            })
        });

        mapPanel = Ext.create('GeoExt.panel.Map', {
            title: 'GeoExt.panel.Map Example',
            map: olMap,
            region: 'center'
        });

        description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'east',
            width: 300,
            border: false,
            bodyPadding: 5
        });

        Ext.create('Ext.Viewport', {
            layout: "border",
            items:[
                mapPanel,
                description
            ]
        });

    }
});
