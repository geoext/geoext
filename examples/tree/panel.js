Ext.require([
    'GeoExt.panel.Map',
    'GeoExt.tree.Panel',
    'GeoExt.data.TreeStore'
]);

Ext.onReady(function(){
    var source,
        layer,
        map,
        zoomslider;

    source1 = new ol.source.MapQuest({layer: 'sat'});
    layer1 = new ol.layer.Tile({
      source: source1
    });

    source2 = new ol.source.MapQuest({layer: 'osm'});
    layer2 = new ol.layer.Tile({
      source: source2
    });

    source3 = new ol.source.MapQuest({layer: 'hyb'});
    layer3 = new ol.layer.Tile({
      source: source3
    });

    group = new ol.layer.Group({
        layers: [layer1,layer2]
    });

    olMap = new ol.Map({
        layers: [
                 group,
                 layer3],
        view: new ol.View({
          center: [0, 0],
          zoom: 2
        })
    });

    mapPanel = Ext.create('GeoExt.panel.Map', {
        title: 'GeoExt.tree.Panel Example',
        width: 800,
        height: 600,
        map: olMap,
        renderTo: 'mapDiv'
    });

    treeStore = Ext.create('GeoExt.data.TreeStore', {
        model: 'GeoExt.data.TreeModel',
        layerStore: mapPanel.getStore()
    });

    treePanel = Ext.create('GeoExt.tree.Panel', {
        title: 'treePanel',
        width: 400,
        height: 600,
        store: treeStore,
        renderTo: 'treeDiv',
        rootVisible: false
    });
});
