Ext.require([
    'GeoExt.component.Map',
    'GeoExt.data.store.LayersTree'
]);

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
        '</tpl>'
    ],

    /**
     * The context for methods available in the template
     */
    valueReplacementContext: {
        hasLegend: function(rec) {
            var isChecked = rec.get('checked');
            var layer = rec.data;
            return isChecked && !(layer instanceof ol.layer.Group);
        },
        getLegendHtml: function(rec) {
            var layer = rec.data;
            var legendUrl = layer.get('legendUrl');
            if (!legendUrl) {
                legendUrl = 'https://geoext.github.io/geoext2/' +
                    'website-resources/img/GeoExt-logo.png';
            }
            return '<img class="legend" src="' + legendUrl + '" height="32" />';
        }
    },

    init: function(column) {
        var me = this;
        if (!(column instanceof Ext.grid.column.Column)) {
            Ext.log.warn('Plugin shall only be applied to instances of' +
                    ' Ext.grid.column.Column');
            return;
        }
        var valuePlaceHolderRegExp = /\{value\}/g;
        var replacementTpl = me.valueReplacementTpl.join('');
        var newCellTpl = me.originalCellTpl.replace(
            valuePlaceHolderRegExp, replacementTpl
        );

        column.cellTpl = [
            newCellTpl,
            me.valueReplacementContext
        ];
    }
});

var mapComponent;
var mapPanel;
var treePanel;
var treePanel2;

Ext.application({
    name: 'LegendTrees',
    launch: function() {
        var source1;
        var source2;
        var source3;
        var layer1;
        var layer2;
        var layer3;
        var layer4;
        var group;
        var olMap;
        var treeStore;
        var treeStore2;


        source1 = new ol.source.Stamen({layer: 'watercolor'});
        layer1 = new ol.layer.Tile({
            legendUrl: 'https://stamen-tiles-d.a.ssl.fastly.net/' +
                'watercolor/2/1/0.jpg',
            source: source1,
            name: 'Stamen Watercolor'
        });

        source2 = new ol.source.Stamen({layer: 'terrain-labels'});
        layer2 = new ol.layer.Tile({
            legendUrl: 'https://stamen-tiles-b.a.ssl.fastly.net/' +
                'terrain-labels/4/4/6.png',
            source: source2,
            name: 'Stamen Terrain Labels'
        });

        source3 = new ol.source.TileWMS({
            url: 'https://ows.terrestris.de/osm-gray/service',
            params: {'LAYERS': 'OSM-WMS', 'TILED': true}
        });
        layer3 = new ol.layer.Tile({
            legendUrl: 'https://ows.terrestris.de/osm-gray/service?' +
                'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&' +
                'TRANSPARENT=true&LAYERS=OSM-WMS&TILED=true&WIDTH=256&' +
                'HEIGHT=256&CRS=EPSG%3A3857&STYLES=&' +
                'BBOX=0%2C0%2C10018754.171394622%2C10018754.171394622',
            source: source3,
            name: 'terrestris OSM WMS',
            visible: false
        });

        layer4 = new ol.layer.Vector({
            source: new ol.source.Vector(),
            name: 'Vector '
        });

        group = new ol.layer.Group({
            layers: [layer1, layer2],
            name: 'Some Stamen Layers'
        });

        olMap = new ol.Map({
            layers: [group, layer3, layer4],
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
            layout: 'fit',
            border: false,
            items: [mapComponent]
        });

        treeStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: olMap.getLayerGroup()
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
                                ptype: 'basic_tree_column_legend'
                            }
                        ]
                    }
                ]
            }
        });

        treeStore2 = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: olMap.getLayerGroup()
        });

        treePanel2 = Ext.create('Ext.tree.Panel', {
            title: 'treePanel',
            store: treeStore2,
            rootVisible: false,
            border: false,
            flex: 1,
            hideHeaders: true,
            lines: false,
            features: [{
                ftype: 'rowbody',
                setupRowData: function(rec, rowIndex, rowValues) {
                    var headerCt = this.view.headerCt;
                    var colspan = headerCt.getColumnCount();
                    var isChecked = rec.get('checked');
                    var layer = rec.data;
                    var GrpClass = ol.layer.Group;
                    var hasLegend = isChecked && !(layer instanceof GrpClass);
                    var legendUrl = hasLegend && layer.get('legendUrl');
                    var legHtml = '';

                    if (!legendUrl) {
                        legendUrl = 'https://geoext.github.io/geoext2/' +
                            'website-resources/img/GeoExt-logo.png';
                    }
                    legHtml = '<img class="legend" src="' + legendUrl +
                        '" height="32" />';

                    // Usually you would style the my-body-class in CSS file
                    Ext.apply(rowValues, {
                        rowBody: hasLegend ? legHtml : '',
                        rowBodyCls: 'my-body-class',
                        rowBodyColspan: colspan
                    });
                }
            }]
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
                        description,
                        treePanel2
                    ]
                }
            ]
        });
    }
});
