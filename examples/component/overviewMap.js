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

    source2 = new ol.source.MapQuest({layer: 'osm'});
    layer2 = new ol.layer.Tile({
      source: source2
    });

    olMap = new ol.Map({
        layers: [layer],
        interactions: ol.interaction.defaults().extend([
            new ol.interaction.DragRotateAndZoom()
        ]),
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
        parentMap: olMap,
        magnification: 10,
        layers: [layer2],
        anchorStyle: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              }),
              stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
              }),
              image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                  color: '#ffcc33'
                })
              })
        }),
        boxStyle: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            })
        })
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
