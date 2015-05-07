Ext.require([
    'GeoExt.panel.Map',
    'GeoExt.component.OverviewMap'
]);

var mapPanel,
    overviewMap1,
    overviewMap2;

Ext.application({
    name: 'OverviewMaps',
    launch: function(){
        var source, source2,
            layer, layer2,
            olMap,
            description,
            ovMapPanel1, ovMapPanel2;

        source = new ol.source.MapQuest({layer: 'sat'});
        layer = new ol.layer.Tile({
          source: source
        });

        source2 = new ol.source.MapQuest({layer: 'osm'});
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

        mapPanel = Ext.create('GeoExt.panel.Map', {
            title: 'GeoExt.component.OverviewMap Example',
            map: olMap,
            region: 'center',
            border: false
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
            layout: "border",
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
