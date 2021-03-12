Ext.require([
    'GeoExt.component.Map',
    'GeoExt.data.store.Layers',
    'Ext.panel.Panel',
    'Ext.grid.Grid',
    'Ext.Viewport',
    'Ext.Toolbar',
    'Ext.Button',
    'Ext.TabPanel'
]);

var olMap;
var mapComponent;
var mapPanel;
var layerStore;
var layerList;
var description;

Ext.application({
    name: 'modern-layerlist',
    launch: function() {

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    name: 'OSM',
                    source: new ol.source.OSM()
                }),
                new ol.layer.Tile({
                    name: 'Labels',
                    source: new ol.source.Stamen({
                        layer: 'terrain-labels'
                    })
                }),
                new ol.layer.Vector({
                    name: 'Earthquakes',
                    source: new ol.source.Vector({
                        url: '../data/1.0_week.geojson',
                        format: new ol.format.GeoJSON()
                    }),
                    style: new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: new ol.style.Fill({color: 'red'}),
                            stroke: new ol.style.Stroke({color: 'darkred'}),
                            points: 3,
                            radius: 6
                        })
                    })
                })
            ],
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'Map Panel',
            layout: 'fit',
            items: [mapComponent]
        });

        layerStore = Ext.create('GeoExt.data.store.Layers', {
            map: olMap
        });

        // handler for showing / hiding of layers via layer list
        var onSelect = function(grid, record) {
            var layer = record.getOlLayer();
            layer.setVisible(true);
        };
        var onDeselect = function(grid, record) {
            var layer = record.getOlLayer();
            layer.setVisible(false);
        };

        // use a grid with 1 colum as layer list
        layerList = Ext.create('Ext.grid.Grid', {
            title: 'Layer List',
            columns: [
                {text: 'Name', dataIndex: 'text', flex: 1}
            ],
            store: layerStore,
            mode: 'MULTI',
            striped: false,
            listeners: {
                select: onSelect,
                deselect: onDeselect
            }
        });

        // synchronize the initial layer visibility and the list selection
        layerList.on('show', function() {
            var selection = [];
            layerList.getStore().each(function(rec) {
                var layer = rec.getOlLayer();
                if (layer.getVisible() === true) {
                    selection.push(rec);
                }
            });
            // set visible layer recs as initial selection
            layerList.setSelection(selection);

        }, layerList, {single: true});

        description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            modal: true,
            centered: true,
            scrollable: true,
            width: 400,
            height: 400,
            bodyPadding: 5,
            hidden: true,
            closeAction: 'hide'
        });
        Ext.Viewport.add(description);

        // Create viewport and also add a button showing a description with the
        // link to this source code
        var viewport = Ext.create('Ext.TabPanel', {
            fullscreen: true,
            ui: 'dark',
            tabBar: {
                docked: 'top',
                layout: {
                    pack: 'center'
                }
            },
            items: [
                mapPanel,
                layerList,
                {
                    xtype: 'toolbar',
                    docked: 'bottom',
                    items: [
                        {
                            text: 'Description',
                            handler: function() {
                                description.show();
                            }
                        }
                    ]
                }
            ]
        });

        // close the modal description when clicking mask
        viewport.mon(Ext.getBody(), 'click', function(el, e) {
            description.close(description.closeAction);
        }, viewport, {delegate: '.x-mask'});
    }
});
