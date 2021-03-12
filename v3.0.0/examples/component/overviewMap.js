Ext.require([
    'GeoExt.component.Map',
    'GeoExt.component.OverviewMap'
]);

var mapComponent;
var mapPanel;
var overviewMap1;
var overviewMap2;

Ext.application({
    name: 'OverviewMaps',
    launch: function() {
        var source;
        var source2;
        var layer;
        var layer2;
        var olMap;
        var description;
        var ovMapPanel1;
        var ovMapPanel2;

        source = new ol.source.OSM();
        layer = new ol.layer.Tile({
            source: source
        });


        source2 = new ol.source.TileWMS({
            url: 'https://ows.terrestris.de/osm-gray/service',
            params: {'LAYERS': 'OSM-WMS', 'TILED': true}
        });
        layer2 = new ol.layer.Tile({
            source: source2
        });

        olMap = new ol.Map({
            layers: [layer],
            interactions: ol.interaction.defaults().extend([
                new ol.interaction.DragRotateAndZoom()
            ]),
            view: new ol.View({
                center: [0, 0],
                zoom: 4
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'GeoExt.component.OverviewMap Example',
            region: 'center',
            layout: 'fit',
            border: false,
            items: [mapComponent]
        });

        overviewMap1 = Ext.create('GeoExt.component.OverviewMap', {
            parentMap: olMap
        });

        overviewMap2 = Ext.create('GeoExt.component.OverviewMap', {
            parentMap: olMap,
            magnification: 12,
            layers: [layer2],
            anchorStyle: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: 'rgb(255, 204, 51)'
                    })
                })
            }),
            boxStyle: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(255, 204, 51)',
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 204, 51, 0.2)'
                })
            })
        });

        description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            flex: 1,
            border: false,
            bodyPadding: 5,
            autoScroll: true
        });

        ovMapPanel1 = Ext.create('Ext.panel.Panel', {
            title: 'OverviewMap (default)',
            flex: 1,
            layout: 'fit',
            items: overviewMap1
        });

        ovMapPanel2 = Ext.create('Ext.panel.Panel', {
            title: 'OverviewMap (configured)',
            flex: 1,
            layout: 'fit',
            items: overviewMap2
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                mapPanel,
                {
                    xtype: 'panel',
                    region: 'east',
                    width: 400,
                    border: false,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        ovMapPanel1,
                        description,
                        ovMapPanel2
                    ]
                }
            ]
        });
    }
});
