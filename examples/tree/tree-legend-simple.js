Ext.require([
    'GeoExt.component.Map',
    'GeoExt.tree.Panel',
    'GeoExt.data.TreeStore'
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
                '<img src="{parent.blankUrl}" class="{parent.childCls} {parent.elbowCls}-img ',
                '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>" role="presentation"/>',
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
        hasLegend: function(rec){
            var isChecked = rec.get('checked');
            var layer = rec.data;
            return isChecked && !(layer instanceof ol.layer.Group);
        },
        getLegendHtml: function(rec){
            var layer = rec.data;
            var legendUrl = layer.get('legendUrl');
            if (!legendUrl) {
                legendUrl = "http://geoext.github.io/geoext2/website-resources/img/GeoExt-logo.png";
            }
            return '<img class="legend" src="' + legendUrl + '" height="32" />';
        }
    },

    init: function(column){
        var me = this;
        if(!(column instanceof Ext.grid.column.Column)) {
            Ext.log.warn("Plugin shall only be applied to instances of" +
                    " Ext.grid.column.Column");
            return;
        }
        var valuePlaceHolderRegExp = /\{value\}/g;
        var replacementTpl = me.valueReplacementTpl.join('');
        var newCellTpl = me.originalCellTpl.replace(valuePlaceHolderRegExp, replacementTpl);

        column.cellTpl = [
            newCellTpl,
            me.valueReplacementContext
        ];
    }
});

var mapComponent, mapPanel,
    treePanel, treePanel2;

Ext.application({
    name: 'LegendTrees',
    launch: function(){
        var source1, source2, source3,
            layer1, layer2, layer3, layer4,
            group,
            olMap,
            treeStore, treeStore2;

        source1 = new ol.source.MapQuest({layer: 'sat'});
        layer1 = new ol.layer.Tile({
            legendUrl: 'https://otile4-s.mqcdn.com/tiles/1.0.0/sat/4/4/7.jpg',
            source: source1,
            name: 'MapQuest Satellite'
        });

        source2 = new ol.source.MapQuest({layer: 'osm'});
        layer2 = new ol.layer.Tile({
            legendUrl: 'https://otile4-s.mqcdn.com/tiles/1.0.0/osm/4/4/7.jpg',
            source: source2,
            name: 'MapQuest OSM'
        });

        source3 = new ol.source.MapQuest({layer: 'hyb'});
        layer3 = new ol.layer.Tile({
            legendUrl: 'https://otile4-s.mqcdn.com/tiles/1.0.0/hyb/4/4/7.jpg',
            source: source3,
            name: 'MapQuest Hybrid'
        });

        layer4 = new ol.layer.Vector({
            source: new ol.source.Vector(),
            name: 'Vector '
        });

        group = new ol.layer.Group({
            layers: [layer1, layer2]
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

        treeStore = Ext.create('GeoExt.data.TreeStore', {
            layerGroup: olMap.getLayerGroup()
        });

        treePanel = Ext.create('GeoExt.tree.Panel', {
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

        treeStore2 = Ext.create('GeoExt.data.TreeStore', {
            layerGroup: olMap.getLayerGroup()
        });

        treePanel2 = Ext.create('GeoExt.tree.Panel', {
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
                    var headerCt = this.view.headerCt,
                        colspan = headerCt.getColumnCount(),
                        isChecked = rec.get('checked'),
                        layer = rec.data,
                        hasLegend = isChecked && !(layer instanceof ol.layer.Group),
                        legendUrl = hasLegend && layer.get('legendUrl'),
                        legHtml = "";

                    if (!legendUrl) {
                        legendUrl = "http://geoext.github.io/geoext2/website-resources/img/GeoExt-logo.png";
                    }
                    legHtml = '<img class="legend" src="' + legendUrl + '" height="32" />';

                    // Usually you would style the my-body-class in CSS file
                    Ext.apply(rowValues, {
                        rowBody: hasLegend ? legHtml : "",
                        rowBodyCls: "my-body-class",
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
            layout: "border",
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
