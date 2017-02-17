Ext.require([
    'Ext.container.Container',
    'Ext.panel.Panel',
    'Ext.grid.Panel',
    'GeoExt.component.Map',
    'GeoExt.data.store.Features',
    'GeoExt.component.FeatureRenderer'
]);

var olMap;
var gridWest;
var gridEast;
var featStore1;
var featStore2;

Ext.application({
    name: 'FeatureGrids',
    launch: function() {
        // Create a local alias
        var featRenderer = GeoExt.component.FeatureRenderer;
        var geojson1 = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Hamburg',
                        'pop': 1700000
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            10.107421874999998,
                            53.527247970102465
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Frankfurt / Main',
                        'pop': 700000
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            8.76708984375,
                            50.064191736659104
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Berlin',
                        'pop': 3500000
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            13.447265624999998,
                            52.53627304145948
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'München',
                        'pop': 1400000
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            11.6455078125,
                            48.1367666796927
                        ]
                    }
                }
            ]
        };

        var geojson2 = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Dortmund'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            7.481689453125,
                            51.49506473014368
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Köln'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            6.976318359375,
                            50.93073802371819
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Kaiserslautern'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            7.7838134765625,
                            49.44670029695474
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Bonn'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            7.102661132812499,
                            50.74688365485319
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Stuttgart'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            9.1461181640625,
                            48.77429274267509
                        ]
                    }
                }
            ]
        };

        // style objects
        var blueStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#0099CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        });
        var redStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#8B0000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        });
        var selectStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#EE0000'
                }),
                stroke: new ol.style.Stroke({
                    color: 'gray',
                    width: 3
                })
            })
        });

        // create a feature collection in order to put into a feature store
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geojson1, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        var featColl = new ol.Collection(vectorSource.getFeatures());

        // loading data via into ol source and create a vector layer to bind a
        // vector layer to a feature store
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(geojson2, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                })
            }),
            style: redStyle
        });

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: 'https://ows.terrestris.de/osm-gray/service',
                        params: {'LAYERS': 'OSM-WMS', 'TILED': true}
                    })
                }),
                vectorLayer
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([8, 50]),
                zoom: 5
            })
        });

        // create feature store by passing a feature collection
        featStore1 = Ext.create('GeoExt.data.store.Features', {
            fields: ['city', 'pop'],
            model: 'GeoExt.data.model.Feature',
            features: featColl,
            map: olMap,
            createLayer: true,
            style: blueStyle
        });
        // create feature store by passing a vector layer
        featStore2 = Ext.create('GeoExt.data.store.Features', {
            layer: vectorLayer,
            map: olMap
        });

        // default feature grid
        gridWest = Ext.create('Ext.grid.Panel', {
            title: 'Feature Grid',
            border: true,
            region: 'west',
            store: featStore1,
            columns: [
                {
                    xtype: 'widgetcolumn',
                    width: 40,
                    widget: {
                        xtype: 'gx_renderer'
                    },
                    onWidgetAttach: function(column, gxRenderer, record) {
                        // update the symbolizer with the related feature
                        var feature = record.getFeature();
                        gxRenderer.update({
                            feature: feature,
                            symbolizers: featRenderer.determineStyle(record)
                        });
                    }
                },
                {text: 'Name', dataIndex: 'city', flex: 1},
                {
                    text: 'Population',
                    dataIndex: 'pop',
                    xtype: 'numbercolumn',
                    format: '0,000',
                    flex: 1
                }
            ],
            width: 250
        });

        // feature grid with some selection logic
        gridEast = Ext.create('Ext.grid.Panel', {
            title: 'Feature Grid with selection',
            border: true,
            region: 'east',
            store: featStore2,
            columns: [
                {
                    xtype: 'widgetcolumn',
                    width: 40,
                    widget: {
                        xtype: 'gx_renderer'
                    },
                    onWidgetAttach: function(column, gxRenderer, record) {
                        // update the symbolizer with the related feature
                        var feature = record.olObject;
                        gxRenderer.update({
                            feature: feature,
                            symbolizers: featRenderer.determineStyle(record)
                        });
                    }
                },
                {text: 'Name', dataIndex: 'city', flex: 2}
            ],
            width: 250,
            listeners: {
                'selectionchange': function(grid, selected) {
                    // reset all selections
                    featStore2.each(function(rec) {
                        rec.getFeature().setStyle(redStyle);
                    });
                    // highlight grid selection in map
                    Ext.each(selected, function(rec) {
                        rec.getFeature().setStyle(selectStyle);
                    });
                }
            }
        });

        var mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });
        var mapPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            height: 400,
            layout: 'fit',
            items: [mapComponent]
        });

        var description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            region: 'south',
            title: 'Description',
            height: 180,
            border: false,
            bodyPadding: 5,
            autoScroll: true
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [mapPanel, gridWest, gridEast, description]
        });
    }
});
