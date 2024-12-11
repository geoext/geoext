Ext.require([
    'Ext.container.Container',
    'Ext.panel.Panel',
    'Ext.grid.Panel',
    'GeoExt.component.Map',
    'GeoExt.data.store.WfsFeatures'
]);

Ext.Loader.loadScript({
    url: '../../classic/toolbar/WfsPaging.js'
});

var olMap;
var gridWest;
var featStore;

Ext.application({
    name: 'FeatureGridWithPaging',
    launch: function() {
        // a WFS feature store
        featStore = Ext.create('GeoExt.data.store.WfsFeatures', {
            model: 'GeoExt.data.model.Feature',
            passThroughFilter: true,
            createLayer: true,
            layerAttribution: '| <a href="https://www.dwd.de/"> ' +
                'Source: Deutscher Wetterdienst</a>',
            url: 'https://maps.dwd.de/geoserver/dwd/ows?',
            version: '2.0.0',
            typeName: 'dwd:Warngebiete_Kreise',
            outputFormat: 'application/json',
            sorters: 'NAME',
            startIndex: 0,
            count: 10,
            remoteSort: true,
            format: new ol.format.GeoJSON({
                featureProjection: 'EPSG:3857'
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 0, 1.0)',
                    width: 2
                })
            })
        });

        // feature grid with paging toolbar showing the WFS features
        gridWest = Ext.create('Ext.grid.Panel', {
            title: 'WFS Feature Grid with paging toolbar',
            width: 500,
            border: true,
            region: 'west',
            store: featStore,
            columns: [
                {
                    text: 'Cell ID',
                    dataIndex: 'WARNCELLID',
                    flex: 1,
                    filter: {
                        type: 'list'
                    }
                },
                {
                    text: 'Name',
                    dataIndex: 'NAME',
                    flex: 2,
                    filter: {
                        type: 'string'
                    }
                }
            ],
            bbar: {
                // WFS paging toolbar
                xtype: 'gx_wfspaging_toolbar',
                displayInfo: true
            }
        });

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: 'https://ows.terrestris.de/osm-gray/service',
                        params: {'LAYERS': 'OSM-WMS', 'TILED': true},
                        attributions:
                            '<a href="https://www.openstreetmap.org/' +
                            'copyright">OpenStreetMap contributors</a>'
                    })
                }),
                // WFS Layer
                featStore.layer
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([8, 50]),
                zoom: 5
            })
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
            region: 'north',
            title: 'Description',
            height: 150,
            border: false,
            bodyPadding: 5,
            autoScroll: true
        });
        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [description, mapPanel, gridWest]
        });
    }
});
