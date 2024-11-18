Ext.require([
  'GeoExt.component.Map',
  'GeoExt.data.store.Layers',
  'Ext.Panel',
  'Ext.grid.Grid',
  'Ext.Toolbar',
  'Ext.Button',
  'Ext.TabPanel',
]);

let olMap;
let mapComponent;
let mapPanel;
let layerStore;
let layerList;

Ext.application({
  name: 'modern-layerlist',
  launch: function () {
    olMap = new ol.Map({
      layers: [
        new ol.layer.Tile({
          name: 'OSM',
          source: new ol.source.OSM(),
        }),
        new ol.layer.Tile({
          name: 'Labels',
          source: new ol.source.StadiaMaps({
            layer: 'stamen_terrain_labels',
          }),
        }),
        new ol.layer.Vector({
          name: 'Earthquakes',
          source: new ol.source.Vector({
            url: '../data/1.0_week.geojson',
            format: new ol.format.GeoJSON(),
          }),
          style: new ol.style.Style({
            image: new ol.style.RegularShape({
              fill: new ol.style.Fill({color: 'red'}),
              stroke: new ol.style.Stroke({color: 'darkred'}),
              points: 3,
              radius: 6,
            }),
          }),
        }),
      ],
      view: new ol.View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    mapComponent = Ext.create('GeoExt.component.Map', {
      map: olMap,
    });

    mapPanel = Ext.create('Ext.panel.Panel', {
      title: 'Map Panel',
      layout: 'fit',
      items: [mapComponent],
    });

    layerStore = Ext.create('GeoExt.data.store.Layers', {
      map: olMap,
    });

    // handler for showing / hiding of layers via layer list
    const onSelectionChanged = function (grid, selected) {
      const selection = grid.getSelections();
      layerList.getStore().each(function (rec) {
        const layer = rec.getOlLayer();
        const isVisible = Ext.Array.contains(selection, rec);
        layer.setVisible(isVisible);
      });
    };

    // use a grid with 1 column as layer list
    layerList = Ext.create('Ext.grid.Grid', {
      title: 'Layer List',
      columns: [{text: 'Name', dataIndex: 'text', flex: 1}],
      store: layerStore,
      mode: 'MULTI',
      striped: false,
      listeners: {
        selectionchange: onSelectionChanged,
      },
    });

    // synchronize the initial layer visibility and the list selection
    layerList.on(
      'show',
      function () {
        const selection = [];
        layerList.getStore().each(function (rec) {
          const layer = rec.getOlLayer();
          if (layer.getVisible() === true) {
            selection.push(rec);
          }
        });
        // set visible layer recs as initial selection
        layerList.setSelection(selection);
      },
      layerList,
      {single: true},
    );

    const htmlString = `
    <p>
        This example shows how to use an <code>Ext.grid.Grid</code> component
        with a <code>GeoExt.data.store.Layers</code>
        to let the user change the visibility of the map layers in a GeoExt app
        with the modern toolkit.
    </p>
    <p>
        Have a look at <a href="modern-layerlist.js">modern-layerlist.js</a>
        to see how this is done.
    </p>
`;

    // Create viewport and also add a button showing a description with the
    // link to this source code
    Ext.create('Ext.TabPanel', {
      fullscreen: true,
      ui: 'dark',
      tabBar: {
        docked: 'top',
        layout: {
          pack: 'center',
        },
      },
      items: [
        mapPanel,
        layerList,
        {
          xtype: 'toolbar',
          docked: 'bottom',
          items: [
            {
              text: 'Description',
              handler: function () {
                var dialog = Ext.create({
                  xtype: 'dialog',
                  title: 'Description',

                  maximizable: true,
                  html: htmlString,

                  buttons: {
                    ok: function () {
                      dialog.destroy();
                    },
                  },
                });

                dialog.show();
              },
            },
          ],
        },
      ],
    });
  },
});
