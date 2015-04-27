Ext.define('GeoExt.data.TreeStore', {
    extend: 'Ext.data.TreeStore',
    requires: [
       'GeoExt.data.LayerModel'
    ],

    model: 'GeoExt.data.LayerModel',

    config: {
        layerStore: null
    },

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    constructor: function(config){
        var me = this;

        if(!me.getLayerStore()){
            me.setLayerStore(config.layerStore)
        }

        me.callParent(config);
    },

    listeners: {
        nodebeforeExpand: function(node, eOpts){
            var me = this;
            if(node.isRoot()){
                Ext.each(me.getLayerStore().getRange(),
                    function(rec, index, range){
                        me.addLayerNodes(node, rec);
                    }
                )
            }
        },
        update: function(store, record, operation, modifiedFieldNames, details, eOpts){
            if(record.data instanceof ol.layer.Base){
                record.data.setVisible(record.data.checked);
            }
        }
    },

    addLayerNodes: function(node ,rec){
        var me = this,
            layer = rec instanceof ol.layer.Base ? rec : rec.data;

        layer.checked = layer.visible;
        layer.on('change:visible', me.onLayerVisibleChange, me);

        if(layer instanceof ol.layer.Group){
            folderNode = node.appendChild(layer);
            layer.text = 'ol.layer.Group';
            layer.treeNode = folderNode;
            Ext.each(layer.getLayersArray(),
                function(childLayer, index, groupArray){
                    childLayer.visible = layer.visible;
                    me.addLayerNodes(folderNode, childLayer);
                }
            );
        } else {
            layer.text = layer.getSource().getLayer();
            layer.leaf = true;
            layerNode = node.appendChild(layer);
            layer.treeNode = layerNode;
        }
    },

    onLayerVisibleChange: function(evt){
        var me = this,
            layer = evt.target;
            layerNode = me.getNodeById(layer.id);

            if(layerNode && layer){
                layerNode.set('checked', layer.getVisible());
            }
    }
});
