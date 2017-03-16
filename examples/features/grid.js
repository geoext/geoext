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
                        'city': 'Berlin',
                        'pop': 3500000
                    },
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [
                                    13.238525390625,
                                    52.44261787120725
                                ],
                                [
                                    13.568115234375,
                                    52.44261787120725
                                ],
                                [
                                    13.568115234375,
                                    52.60971939156648
                                ],
                                [
                                    13.238525390625,
                                    52.60971939156648
                                ],
                                [
                                    13.238525390625,
                                    52.44261787120725
                                ]
                            ]
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Hamburg',
                        'pop': 1700000
                    },
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [
                                    9.832763671875,
                                    53.44880683542759
                                ],
                                [
                                    10.1953125,
                                    53.44880683542759
                                ],
                                [
                                    10.1953125,
                                    53.657661020298
                                ],
                                [
                                    9.832763671875,
                                    53.657661020298
                                ],
                                [
                                    9.832763671875,
                                    53.44880683542759
                                ]
                            ]
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
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [
                                    11.42578125,
                                    48.05605376398125
                                ],
                                [
                                    11.744384765625,
                                    48.05605376398125
                                ],
                                [
                                    11.744384765625,
                                    48.246625590713826
                                ],
                                [
                                    11.42578125,
                                    48.246625590713826
                                ],
                                [
                                    11.42578125,
                                    48.05605376398125
                                ]
                            ]
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
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [
                                    8.558349609375,
                                    50.05008477838256
                                ],
                                [
                                    8.81103515625,
                                    50.05008477838256
                                ],
                                [
                                    8.81103515625,
                                    50.21206446065373
                                ],
                                [
                                    8.558349609375,
                                    50.21206446065373
                                ],
                                [
                                    8.558349609375,
                                    50.05008477838256
                                ]
                            ]
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
            fill: new ol.style.Fill({
                // color: '#0099CC'
                color: 'rgba(0,153,255, 0.3)'
            }),
            stroke: new ol.style.Stroke({
                color: '#0099FF',
                width: 2
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
