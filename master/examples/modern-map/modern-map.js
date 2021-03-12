Ext.require([
    'GeoExt.component.Map',
    'Ext.panel.Panel',
    'Ext.Viewport',
    'Ext.Toolbar',
    'Ext.Button',
    'Ext.TabPanel'
]);

var olMap1;
var olMap2;
var mapComponent1;
var mapComponent2;
var mapPanel1;
var mapPanel2;
var description;

Ext.application({
    name: 'modern-map',
    launch: function() {

        olMap1 = new ol.Map({
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
                center: ol.proj.fromLonLat([-122.416667, 37.783333]),
                zoom: 12
            })
        });

        mapComponent1 = Ext.create('GeoExt.component.Map', {
            map: olMap1
        });

        mapPanel1 = Ext.create('Ext.panel.Panel', {
            title: 'San Francisco',
            layout: 'fit',
            items: [mapComponent1]
        });

        olMap2 = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([9.993682, 53.551086]),
                zoom: 12
            })
        });

        mapComponent2 = Ext.create('GeoExt.component.Map', {
            map: olMap2
        });

        mapPanel2 = Ext.create('Ext.panel.Panel', {
            title: 'Hamburg',
            layout: 'fit',
            items: [mapComponent2]
        });

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
                mapPanel1,
                mapPanel2,
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
