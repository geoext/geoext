Ext.require([
    'Ext.Viewport',
    'Ext.panel.Panel',
    'GeoExt.component.Map'
]);

// load components, which are only compatible with the classic toolkit
Ext.Loader.loadScript({
    url: '../../classic/form/field/GeocoderComboBox.js'
});

var olMap;
var mapComponent;
var mapPanel;
var description;
Ext.application({
    name: 'geocoder-combo',
    launch: function() {

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([0, 0]),
                zoom: 2
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'GeoExt.form.field.GeocoderComboBox Example',
            region: 'center',
            layout: 'fit',
            items: [mapComponent],
            tbar: [{
                xtype: 'gx_geocoder_combo',
                width: 300,
                url: 'https://nominatim.openstreetmap.org/search?format=json',
                map: olMap,
                showLocationOnMap: true,
                locationLayerStyle: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'red'
                    })
                })
            }, {
                xtype: 'checkboxfield',
                boxLabel: 'Restrict to map extent',
                listeners: {
                    'change': function(cb, val) {
                        var combo = cb.up().down('gx_geocoder_combo');
                        if (combo) {
                            var evtName = val ?
                                'restrictToMapExtent' :
                                'unRestrictMapExtent';
                            combo.fireEvent(evtName);
                        }
                    }
                }
            }]
        });

        description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'south',
            height: 200,
            border: false,
            bodyPadding: 5
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                mapPanel,
                description
            ]
        });
    }
});
