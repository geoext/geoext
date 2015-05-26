Ext.require([
    'GeoExt.data.MapfishPrintProvider',
    'GeoExt.panel.Map'
]);

var olMap;
var mapPanel;

Ext.application({
    name: 'MapPanel',
    launch: function(){
        var description;

        var extentLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: 'http://ows.terrestris.de/osm-gray/service',
                        params: {
                            LAYERS: "OSM-WMS"
                        }
                    })
                }),
                extentLayer
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat( [-122.416667, 37.783333] ),
                zoom: 12
            })
        });

        mapPanel = Ext.create('GeoExt.panel.Map', {
            title: 'GeoExt.data.model.PrintCapability Example',
            map: olMap,
            region: 'center'
        });

        description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'east',
            width: 300,
            border: false,
            bodyPadding: 5
        });

        /**
         * Once the store is loaded, we can create the button with the
         * following assumptions:
         *
         *     * The button will print the first layout
         *     * The attributes used are the first of the above layout
         *     * We'll request the first dpi value of the suggested ones
         */
        var onPrintProviderReady = function(provider) {
            // this is the assumption: take the first layout and render an appropriate
            // extent on the map
            var capabilities = provider.capabilityRec;
            var layout = capabilities.layouts().getAt(0);
            var attr = layout.attributes().getAt(0);
            var clientInfo = attr.get('clientInfo');
            GeoExt.data.MapfishPrintProvider.renderPrintExtent(mapPanel, extentLayer, clientInfo);
            mapPanel.getView().on('propertychange', function(){
                GeoExt.data.MapfishPrintProvider.renderPrintExtent(extentLayer, clientInfo);
            });
            description.add({
                xtype: 'button',
                text: 'Print',
                handler: function(){
                    var spec = {
                        layout: layout.get('name'),
                        attributes: {}
                    };
                    var bbox = extentLayer.getSource().getFeatures()[0].getGeometry().getExtent();
                    var serializedLayers = GeoExt.data.MapfishPrintProvider.getSerializedLayers(mapPanel.getStore());
                    spec.attributes[attr.get('name')] = {
                        bbox: bbox,
                        dpi: clientInfo.dpiSuggestions[0],
                        layers: serializedLayers,
                        projection: mapPanel.getView().getProjection().getCode(),
                        rotation: mapPanel.getView().getRotation()
                    };
                    Ext.create('Ext.form.Panel', {
                        standardSubmit: true,
                        url: 'http://webmapcenter.de/print-servlet-3.1.2/print/geoext/buildreport.pdf',
                        method: 'POST',
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'spec',
                                value: Ext.encode(spec)
                            }
                        ]
                    }).submit();
                }
            });
        };

        Ext.create('GeoExt.data.MapfishPrintProvider', {
            url: "http://webmapcenter.de/print-servlet-3.1.2/print/geoext/capabilities.json",
            listeners: {
                ready: onPrintProviderReady
            }
        });

        Ext.create('Ext.Viewport', {
            layout: "border",
            items: [
                mapPanel,
                description
            ]
        });

    }
});
