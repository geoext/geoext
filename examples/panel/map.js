Ext.require(
    'GeoExt.*'
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
});
