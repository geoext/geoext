Ext.require([
    'Ext.slider.Single',
    'Ext.panel.Panel',
    'Ext.Viewport',
    'GeoExt.component.Map',
    'GeoExt.data.store.Features'
]);

var olMap;
var mapComponent;
var mapPanel;
var slider;
var featStore;

Ext.application({
    name: 'FilteredHeatmap',
    launch: function() {
        // The OL source which will hold our features
        var vectorSource = new ol.source.Vector();

        // Loading the vector data manually, so we can avoid using the
        // 'url'-parameter of ol.source.Vector. Otherwise filtering of the
        // FeatureStore would have no effect.
        Ext.Ajax.request({
            url: '../data/1.0_week.geojson',
            success: function(response) {
                var geojson = Ext.decode(response.responseText);
                var gjFormat = new ol.format.GeoJSON({
                    featureProjection: 'EPSG:3857'
                });
                var features = gjFormat.readFeatures(geojson);
                vectorSource.addFeatures(features);
            },
            disableCaching: false
        });

        // Create an OL heatmap layer
        var heatMapLayer = new ol.layer.Heatmap({
            name: 'Heatmap',
            source: vectorSource,
            blur: 15,
            radius: 5
        });

        var bgLayer = new ol.layer.Tile({
            source: new ol.source.Stamen({
                layer: 'toner'
            })
        });

        olMap = new ol.Map({
            layers: [
                bgLayer,
                heatMapLayer
            ],
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });

        // create a FeatureStore and bind the heatmap layer to it
        featStore = Ext.create('GeoExt.data.store.Features', {
            layer: heatMapLayer,
            // enables that the store's filter is applied to the layer-source
            passThroughFilter: true
        });

        // a slider-UI to change interactively the filter by the maginitude
        slider = Ext.create('Ext.slider.Single', {
            fieldLabel: 'Earthquake Magnitude',
            width: 500,
            value: 1,
            increment: 0.1,
            minValue: 1,
            maxValue: 7,
            tipText: function(thumb) {
                return 'Magnitude >=' + String(thumb.value);
            },
            listeners: {
                change: function(sliderRef, newValue, thumb) {
                    // adapt the filter when the slider value changes
                    featStore.clearFilter();
                    featStore.filterBy(function(rec) {
                        var feat = rec.getFeature();
                        return feat.get('mag') >= newValue;
                    });
                }
            }
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'Filtered FeatureStore in sync with the map',
            tbar: [slider],
            region: 'center',
            layout: 'fit',
            items: [mapComponent]
        });

        var description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'east',
            width: 300,
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
