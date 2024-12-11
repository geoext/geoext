Ext.require(['GeoExt.component.Map', 'GeoExt.component.OverviewMap']);

let mapComponent;
let mapPanel;
let overviewMap1;
let overviewMap2;

Ext.application({
  name: 'OverviewMaps',
  launch: function () {
    const layer1 = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });

    const layer2 = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });

    const layer3 = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: 'https://ows.terrestris.de/osm-gray/service',
        params: {LAYERS: 'OSM-WMS', TILED: true},
      }),
    });

    const olMap = new ol.Map({
      layers: [layer1],
      interactions: ol.interaction.defaults
        .defaults()
        .extend([new ol.interaction.DragRotateAndZoom()]),
      view: new ol.View({
        center: [0, 0],
        zoom: 4,
      }),
    });

    mapComponent = Ext.create('GeoExt.component.Map', {
      map: olMap,
    });

    mapPanel = Ext.create('Ext.panel.Panel', {
      title: 'GeoExt.component.OverviewMap Example',
      region: 'center',
      layout: 'fit',
      border: false,
      items: [mapComponent],
    });

    overviewMap1 = Ext.create('GeoExt.component.OverviewMap', {
      parentMap: olMap,
      magnification: 15,
      layers: [layer2],
    });

    overviewMap2 = Ext.create('GeoExt.component.OverviewMap', {
      parentMap: olMap,
      magnification: 20,
      layers: [layer3],
      anchorStyle: new ol.style.Style({
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: 'rgb(255, 204, 51)',
          }),
        }),
      }),
      boxStyle: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgb(255, 204, 51)',
          width: 3,
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 204, 51, 0.2)',
        }),
      }),
    });

    const description = Ext.create('Ext.panel.Panel', {
      contentEl: 'description',
      title: 'Description',
      flex: 1,
      border: false,
      bodyPadding: 5,
      autoScroll: true,
    });

    const ovMapPanel1 = Ext.create('Ext.panel.Panel', {
      title: 'OverviewMap (default)',
      flex: 1,
      layout: 'fit',
      items: overviewMap1,
    });

    const ovMapPanel2 = Ext.create('Ext.panel.Panel', {
      title: 'OverviewMap (configured)',
      flex: 1,
      layout: 'fit',
      items: overviewMap2,
    });

    Ext.create('Ext.Viewport', {
      layout: 'border',
      items: [
        mapPanel,
        {
          xtype: 'panel',
          region: 'east',
          width: 400,
          border: false,
          layout: {
            type: 'vbox',
            align: 'stretch',
          },
          items: [ovMapPanel1, description, ovMapPanel2],
        },
      ],
    });
  },
});
