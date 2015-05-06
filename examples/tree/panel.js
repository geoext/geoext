Ext.require([
    'GeoExt.panel.Map',
    'GeoExt.tree.Panel',
    'GeoExt.data.TreeStore'
]);

var mapPanel,
    treePanel;

Ext.application({
    name: 'BasicTree',
    launch: function(){
        var source1, source2, source3,
            layer1, layer2, layer3,
            group,
            olMap,
            treeStore;
    
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
            name: 'MapQuest Hybrid'
        });
    
        group = new ol.layer.Group({
            layers: [layer1,layer2]
        });
    
        olMap = new ol.Map({
            layers: [group, layer3],
            view: new ol.View({
              center: [0, 0],
              zoom: 2
            })
        });
    
        mapPanel = Ext.create('GeoExt.panel.Map', {
            map: olMap,
            region: 'center',
            border: false
        });
    
        treeStore = Ext.create('GeoExt.data.TreeStore', {
            layerStore: mapPanel.getStore()
        });
    
        treePanel = Ext.create('GeoExt.tree.Panel', {
            title: 'GeoExt.tree.Panel Example',
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
            layout: "border",
            items:[
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
