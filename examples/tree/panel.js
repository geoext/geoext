Ext.require([
    'GeoExt.component.Map',
    'GeoExt.data.store.LayersTree'
]);

var mapComponent;
var mapPanel;
var treePanel;

Ext.application({
    name: 'BasicTree',
    launch: function() {
        var source1;
        var source2;
        var source3;
        var layer1;
        var layer2;
        var layer3;
        var group;
        var olMap;
        var treeStore;

        source1 = new ol.source.MapQuest({layer: 'sat'});
        layer1 = new ol.layer.Tile({
            source: source1,
            name: 'MapQuest Satellite'
        });

        source2 = new ol.source.MapQuest({layer: 'osm'});
        layer2 = new ol.layer.Tile({
            source: source2,
            name: 'MapQuest OSM'
        });

        source3 = new ol.source.MapQuest({layer: 'hyb'});
        layer3 = new ol.layer.Tile({
            source: source3,
            name: 'MapQuest Hybrid',
            description: 'This is a layer description that will be visible '
                + 'as a tooltip.',
            visible: false
        });

        group = new ol.layer.Group({
            // name: 'Other Mapquest Layers',
            layers: [layer1, layer2],
            visible: true
        });


        olMap = new ol.Map({
            layers: [group, layer3],
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            border: false,
            layout: 'fit',
            items: [mapComponent]
        });

        treeStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: olMap.getLayerGroup()
        });

        treePanel = Ext.create('Ext.tree.Panel', {
            title: 'Tree Example',
            viewConfig: {
                plugins: {ptype: 'treeviewdragdrop'}
            },
            store: treeStore,
            rootVisible: false,
            flex: 1,
            border: false
        });

        var description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            height: 200,
            border: false,
            bodyPadding: 5
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                mapPanel,
                {
                    xtype: 'panel',
                    region: 'west',
                    width: 400,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        treePanel,
                        description
                    ]
                }
            ]
        });
    }
});
