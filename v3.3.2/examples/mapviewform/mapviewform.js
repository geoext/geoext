Ext.require([
    'Ext.form.Panel',
    'GeoExt.component.Map',
    'GeoExt.data.model.OlObject'
]);

Ext.application({
    name: 'MapView',
    launch: function() {
        var view = new ol.View({
            center: [1588081, 6993663],
            zoom: 12
        });

        var layer = new ol.layer.Tile({
            source: new ol.source.Stamen({
                layer: 'watercolor'
            })
        });

        var labLayer = new ol.layer.Tile({
            source: new ol.source.Stamen({
                layer: 'terrain-labels'
            })
        });

        // wrap ol.View in GeoExt Object model
        var viewRecord = Ext.create('GeoExt.data.model.OlObject', view);

        // wrap ol.layer.Layer in GeoExt Object model
        var layerRecord = Ext.create('GeoExt.data.model.OlObject', layer);
        var labLayerRecord = Ext.create('GeoExt.data.model.OlObject', labLayer);

        var viewForm = Ext.create('Ext.form.Panel', {
            title: 'View',
            bodyPadding: 5,
            defaults: {
                xtype: 'numberfield',
                allowBlank: false,
                listeners: {
                    change: function() {
                        // update record on form changes
                        viewRecord.set(this.up('form').getValues());
                    }
                }
            },
            items: [{
                fieldLabel: 'Resolution (m)',
                minValue: 1,
                step: 100,
                name: 'resolution'
            }, {
                fieldLabel: 'Rotation (rad)',
                step: 0.1,
                name: 'rotation'
            }]
        });

        var layerForm = Ext.create('Ext.form.Panel', {
            title: 'Watercolor Layer',
            bodyPadding: 5,
            defaults: {
                xtype: 'numberfield',
                decimalPrecision: 3,
                step: 0.125,
                listeners: {
                    change: function() {
                        // update record on form changes
                        layerRecord.set(this.up('form').getValues());
                    }
                }
            },
            items: [{
                fieldLabel: 'Opacity',
                minValue: 0,
                maxValue: 1,
                name: 'opacity',
                allowBlank: false
            }]
        });

        var labLayerForm = Ext.create('Ext.form.Panel', {
            title: 'Labels Layer',
            bodyPadding: 5,
            defaults: {
                xtype: 'numberfield',
                decimalPrecision: 3,
                step: 0.125,
                listeners: {
                    change: function() {
                        // update record on form changes
                        labLayerRecord.set(this.up('form').getValues());
                    }
                }
            },
            items: [{
                fieldLabel: 'Opacity',
                minValue: 0,
                maxValue: 1,
                name: 'opacity',
                allowBlank: false
            }, {
                fieldLabel: 'Visibility',
                xtype: 'checkboxfield',
                name: 'visible',
                uncheckedValue: false
            }]
        });

        // bind map view changes to form
        view.on('propertychange', function() {
            viewForm.loadRecord(viewRecord);
        });

        // bind layers to forms
        layer.on('propertychange', function() {
            layerForm.loadRecord(layerRecord);
        });
        labLayer.on('propertychange', function() {
            labLayerForm.loadRecord(labLayerRecord);
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [{
                region: 'center',
                layout: 'fit',
                items: [{
                    xtype: 'gx_component_map',
                    map: new ol.Map({
                        layers: [
                            layer,
                            labLayer
                        ],
                        view: view
                    }),
                    listeners: {
                        boxready: function() {
                            // init forms with record data
                            viewForm.loadRecord(viewRecord);
                            layerForm.loadRecord(layerRecord);
                            labLayerForm.loadRecord(labLayerRecord);
                        }
                    }
                }]
            }, {
                region: 'east',
                width: 300,
                defaults: {
                    bodyPadding: 5,
                    border: false
                },
                items: [
                    viewForm,
                    layerForm,
                    labLayerForm,
                    {
                        title: 'Description',
                        contentEl: 'description'
                    }
                ]
            }]
        });
    }
});
