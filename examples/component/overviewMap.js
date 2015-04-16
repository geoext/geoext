Ext.require([
    'GeoExt.panel.Map',
    'GeoExt.component.OverviewMap'
]);

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
        title: 'GeoExt.component.OverviewMap Example',
        width: 800,
        height: 600,
        map: olMap,
        renderTo: 'mapDiv'
    });

    overviewMap = Ext.create('GeoExt.component.OverviewMap', {
        parentMap: olMap
    });

    extPanel = Ext.create('Ext.panel.Panel', {
        title: 'OverviewMap in Panel',
        width: 400,
        height: 200,
        layout: 'fit',
        items: [
            overviewMap
        ],
        renderTo: 'panelDiv'
    });
});
