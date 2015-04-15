Ext.require(
    'GeoExt.panel.Map'
);

Ext.onReady(function(){
    var source,
        layer,
        map,
        zoomslider;

    source = new ol.source.MapQuest({layer: 'sat'});
    layer = new ol.layer.Tile({
      source: source
    });

    source2 = new ol.source.MapQuest({layer: 'osm'});
    layer2 = new ol.layer.Tile({
      source: source2
    });

    olMap = new ol.Map({
        layers: [layer],
        view: new ol.View({
          center: [0, 0],
          zoom: 2
        })
    });

    mapPanel = Ext.create('GeoExt.panel.Map', {
        title: 'GeoExt.panel.Map Example',
        width: 800,
        height: 600,
        map: olMap,
        renderTo: 'mapDiv'
    })

    gridPanel = Ext.create('Ext.grid.Panel', {
        title: 'gridPanel',
        columns:[
            {text: 'Opacity', dataIndex:'opacity', flex: 1},
            {text: 'Visible', dataIndex: 'visible', flex: 1},
            {text: 'minResolution', dataIndex: 'minResolution', flex: 1},
            {text: 'maxResolution', dataIndex: 'maxResolution', flex: 1}
        ],
        width: 800,
        height: 600,
        store: mapPanel.getStore(),
        renderTo: 'gridDiv'
    })
});
