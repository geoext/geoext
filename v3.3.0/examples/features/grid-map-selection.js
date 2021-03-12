Ext.require([
    'Ext.container.Container',
    'Ext.panel.Panel',
    'Ext.grid.Panel',
    'GeoExt.component.Map',
    'GeoExt.data.store.Features'
]);

// load components, which are only compatible with the classic toolkit
Ext.Loader.loadScript({
    url: '../../classic/selection/FeatureModel.js'
});

var olMap;
var gridWest;
var featStore;

Ext.application({
    name: 'FeatureGridMapSelection',
    launch: function() {
        var geojson = {
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
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Paris',
                        'pop': 2200000
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            2.35107421875,
                            48.83579746243093
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'Amsterdam',
                        'pop': 870000
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            4.888916015625,
                            52.36218321674427
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'city': 'London',
                        'pop': 8700000
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            -0.1318359375,
                            51.467696956223364
                        ]
                    }
                }
            ]
        };

        // style object for the vector layer
        var vectorStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#0099CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#f0f',
                    width: 2
                })
            })
        });
        // style object for selected features
        var selectStyle = new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({
                    color: '#0099CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#f0f',
                    width: 2
                }),
                points: 5,
                radius: 10,
                radius2: 4,
                angle: 0
            })
        });

        // create a feature collection in order to put into a feature store
        var features = new ol.format.GeoJSON().readFeatures(geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        var featColl = new ol.Collection(features);

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: 'https://ows.terrestris.de/osm-gray/service',
                        params: {'LAYERS': 'OSM-WMS', 'TILED': true}
                    })
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([8, 50]),
                zoom: 5
            })
        });

        // create feature store by passing a feature collection
        featStore = Ext.create('GeoExt.data.store.Features', {
            fields: ['city', 'pop'],
            model: 'GeoExt.data.model.Feature',
            features: featColl,
            map: olMap,
            createLayer: true,
            style: vectorStyle
        });

        // feature grid with a feature selection model
        gridWest = Ext.create('Ext.grid.Panel', {
            title: 'Feature Grid w. SelectionModel',
            border: true,
            region: 'west',
            width: 300,
            store: featStore,
            selModel: {
                type: 'featuremodel',
                mode: 'SINGLE',
                mapSelection: true,
                map: olMap,
                selectStyle: selectStyle
            },
            columns: [
                {text: 'Name', dataIndex: 'city', flex: 1},
                {
                    text: 'Population',
                    dataIndex: 'pop',
                    xtype: 'numbercolumn',
                    format: '0,000',
                    flex: 1
                }
            ],
            bbar: [{
                // segmented button to change the selection mode
                xtype: 'segmentedbutton',
                items: [{
                    text: 'Single',
                    tooltip: 'Only allows selecting one item at a time.',
                    pressed: true
                }, {
                    text: 'Simple',
                    tooltip: 'Allows simple selection of multiple items ' +
                        'one-by-one.'
                }, {
                    text: 'Multi',
                    tooltip: 'Allows complex selection of multiple items.'
                }],
                listeners: {
                    toggle: function(container, button, pressed) {
                        if (pressed) {
                            var gridSelModel = gridWest.getSelectionModel();
                            if (button.text === 'Single') {
                                // reset possible multiple selections for single
                                gridSelModel.deselectAll();
                            }
                            // set new selection mode
                            gridSelModel.setSelectionMode(
                                button.text.toUpperCase()
                            );
                        }
                    }
                }
            }]
        });

        var mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });
        var mapPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
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
            items: [mapPanel, gridWest, description]
        });
    }
});
