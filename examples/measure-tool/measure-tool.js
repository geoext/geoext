Ext.require([
    'Ext.Toolbar',
    'Ext.Button',
    'GeoExt.component.Map',
    'GeoExt.action.Interaction',
    'GeoExt.action.Draw',
    'GeoExt.action.Measure'
]);

Ext.application({
    name: 'measure-tool',
    launch: function() {
        var source = new ol.source.Vector();
        var olMap = window.olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.Stamen({
                        layer: 'terrain'
                    })
                }),
                new ol.layer.Tile({
                    source: new ol.source.Stamen({
                        layer: 'terrain-labels'
                    })
                }),
                new ol.layer.Vector({
                    source: source,
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ffcc33',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: '#ffcc33'
                            })
                        })
                    })
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([13.73836, 51.049259]),
                zoom: 15
            })
        });

        var drawAction = Ext.create('GeoExt.action.Draw', {
            map: olMap,
            source: source,
            type: 'Circle'
        });

        var lineStringMeasureAction = Ext.create('GeoExt.action.Measure', {
            map: olMap,
            source: source,
            type: 'LineString'
        });

        var polygonMeasureAction = Ext.create('GeoExt.action.Measure', {
            text: 'Measure Polygon',
            map: olMap,
            source: source
        });

        var mapPanel = window.mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'GeoExt.action.Measure Example',
            region: 'center',
            layout: 'fit',
            tbar: [
                drawAction,
                lineStringMeasureAction,
                polygonMeasureAction
            ],
            bbar: [
                lineStringMeasureAction,
                polygonMeasureAction
            ],
            items: [{
                xtype: 'gx_component_map',
                map: olMap
            }]
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                mapPanel,
                {
                    contentEl: 'description',
                    title: 'Description',
                    region: 'east',
                    width: 300,
                    border: false,
                    bodyPadding: 5,
                    tbar: [
                        drawAction
                    ]
                }
            ]
        });
    }
});
