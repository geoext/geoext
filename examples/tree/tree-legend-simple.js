Ext.require(['GeoExt.component.Map', 'GeoExt.data.store.LayersTree']);

/**
 * A plugin for Ext.grid.column.Column s that overwrites the internal cellTpl to
 * support legends.
 */
Ext.define('BasicTreeColumnLegends', {
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.basic_tree_column_legend',

  /**
   * @private
   */
  originalCellTpl: Ext.clone(Ext.tree.Column.prototype.cellTpl).join(''),

  /**
   * The Xtemplate strings that will be used instead of the plain {value}
   * when rendering
   */
  valueReplacementTpl: [
    '{value}',
    '<tpl if="this.hasLegend(values.record)"><br />',
    '<tpl for="lines">',
    '<img src="{parent.blankUrl}"',
    ' class="{parent.childCls} {parent.elbowCls}-img ',
    '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>"',
    ' role="presentation"/>',
    '</tpl>',
    '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
    '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
    '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
    '{[this.getLegendHtml(values.record)]}',
    '</tpl>',
  ],

  /**
   * The context for methods available in the template
   */
  valueReplacementContext: {
    hasLegend: function (rec) {
      const isChecked = rec.get('checked');
      const layer = rec.data;
      return isChecked && !(layer instanceof ol.layer.Group);
    },
    getLegendHtml: function (rec) {
      const layer = rec.data;
      let legendUrl = layer.get('legendUrl');
      if (!legendUrl) {
        legendUrl =
          'https://geoext.github.io/geoext2/' +
          'website-resources/img/GeoExt-logo.png';
      }
      return '<img class="legend" src="' + legendUrl + '" height="32" />';
    },
  },

  init: function (column) {
    const me = this;
    if (!(column instanceof Ext.grid.column.Column)) {
      Ext.log.warn(
        'Plugin shall only be applied to instances of' +
          ' Ext.grid.column.Column',
      );
      return;
    }
    const valuePlaceHolderRegExp = /\{value\}/g;
    const replacementTpl = me.valueReplacementTpl.join('');
    const newCellTpl = me.originalCellTpl.replace(
      valuePlaceHolderRegExp,
      replacementTpl,
    );

    column.cellTpl = [newCellTpl, me.valueReplacementContext];
  },
});

let mapComponent;
let mapPanel;
let treePanel;
let treePanel2;

Ext.application({
  name: 'LegendTrees',
  launch: function () {
    const source1 = new ol.source.StadiaMaps({layer: 'stamen_watercolor'});
    const layer1 = new ol.layer.Tile({
      legendUrl:
        'https://tiles.stadiamaps.com/tiles/stamen_watercolor/2/1/0.jpg',
      source: source1,
      name: 'Stamen Watercolor',
    });

    const source2 = new ol.source.StadiaMaps({layer: 'stamen_terrain_labels'});
    const layer2 = new ol.layer.Tile({
      legendUrl:
        'https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/4/4/6.png',
      source: source2,
      name: 'Stamen Terrain Labels',
    });

    const source3 = new ol.source.TileWMS({
      url: 'https://ows.terrestris.de/osm-gray/service',
      params: {LAYERS: 'OSM-WMS', TILED: true},
    });
    const layer3 = new ol.layer.Tile({
      legendUrl:
        'https://ows.terrestris.de/osm-gray/service?' +
        'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&' +
        'TRANSPARENT=true&LAYERS=OSM-WMS&TILED=true&WIDTH=256&' +
        'HEIGHT=256&CRS=EPSG%3A3857&STYLES=&' +
        'BBOX=0%2C0%2C10018754.171394622%2C10018754.171394622',
      source: source3,
      name: 'terrestris OSM WMS',
      visible: false,
    });

    const layer4 = new ol.layer.Vector({
      source: new ol.source.Vector(),
      name: 'Vector ',
    });

    const group = new ol.layer.Group({
      layers: [layer1, layer2],
      name: 'Some Stamen Layers',
    });

    const olMap = new ol.Map({
      layers: [group, layer3, layer4],
      view: new ol.View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    mapComponent = Ext.create('GeoExt.component.Map', {
      map: olMap,
    });

    mapPanel = Ext.create('Ext.panel.Panel', {
      region: 'center',
      layout: 'fit',
      border: false,
      items: [mapComponent],
    });

    const treeStore = Ext.create('GeoExt.data.store.LayersTree', {
      layerGroup: olMap.getLayerGroup(),
    });

    treePanel = Ext.create('Ext.tree.Panel', {
      title: 'Legends in tree panel',
      store: treeStore,
      border: false,
      rootVisible: false,
      hideHeaders: true,
      lines: false,
      flex: 1,
      columns: {
        header: false,
        items: [
          {
            xtype: 'treecolumn',
            dataIndex: 'text',
            flex: 1,
            plugins: [
              {
                ptype: 'basic_tree_column_legend',
              },
            ],
          },
        ],
      },
    });

    const treeStore2 = Ext.create('GeoExt.data.store.LayersTree', {
      layerGroup: olMap.getLayerGroup(),
    });

    treePanel2 = Ext.create('Ext.tree.Panel', {
      title: 'treePanel',
      store: treeStore2,
      rootVisible: false,
      border: false,
      flex: 1,
      hideHeaders: true,
      lines: false,
      features: [
        {
          ftype: 'rowbody',
          setupRowData: function (rec, rowIndex, rowValues) {
            const headerCt = this.view.headerCt;
            const colspan = headerCt.getColumnCount();
            const isChecked = rec.get('checked');
            const layer = rec.data;
            const GrpClass = ol.layer.Group;
            const hasLegend = isChecked && !(layer instanceof GrpClass);
            let legendUrl = hasLegend && layer.get('legendUrl');
            let legHtml = '';

            if (!legendUrl) {
              legendUrl =
                'https://geoext.github.io/geoext2/' +
                'website-resources/img/GeoExt-logo.png';
            }
            legHtml =
              '<img class="legend" src="' + legendUrl + '" height="32" />';

            // Usually you would style the my-body-class in CSS file
            Ext.apply(rowValues, {
              rowBody: hasLegend ? legHtml : '',
              rowBodyCls: 'my-body-class',
              rowBodyColspan: colspan,
            });
          },
        },
      ],
    });

    const description = Ext.create('Ext.panel.Panel', {
      contentEl: 'description',
      title: 'Description',
      height: 200,
      border: false,
      bodyPadding: 5,
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
            align: 'stretch',
          },
          items: [treePanel, description, treePanel2],
        },
      ],
    });
  },
});
