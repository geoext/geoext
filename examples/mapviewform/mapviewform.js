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

        // wrap ol.View in GeoExt Object model
        var viewRecord = Ext.create('GeoExt.data.model.OlObject', view);

        // wrap ol.layer.Layer in GeoExt Object model
        var layerRecord = Ext.create('GeoExt.data.model.OlObject', layer);

        var viewForm = Ext.create('Ext.form.Panel', {
            title: 'View',
            bodyPadding: 5,
            defaults: {
                listeners: {
                    change: function() {
                        // update record on form changes
                        viewRecord.set(this.up('form').getValues());
                    }
                }
            },
            items: [{
                xtype: 'numberfield',
                fieldLabel: 'Resolution (m)',
                minValue: 1,
                step: 100,
                name: 'resolution',
                allowBlank: false
            }, {
                xtype: 'numberfield',
                fieldLabel: 'Rotation (rad)',
                step: 0.1,
                name: 'rotation',
                allowBlank: false
            }]
        });

        var layerForm = Ext.create('Ext.form.Panel', {
            title: 'Layer',
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

        // only possible if webgl renderer is enabled
        if (ol.has.WEBGL) {
            layerForm.add([{
                fieldLabel: 'Brightness',
                name: 'brightness',
                allowBlank: false
            }, {
                fieldLabel: 'Contrast',
                minValue: 0,
                name: 'contrast',
                allowBlank: false
            }, {
                fieldLabel: 'Hue',
                name: 'hue',
                allowBlank: false
            }, {
                fieldLabel: 'Saturation',
                minValue: 0,
                name: 'saturation',
                allowBlank: false
            }]);
        }

        // bind map view changes to form
        view.on('propertychange', function() {
            viewForm.loadRecord(viewRecord);
        });

        // bind layer to form
        layer.on('propertychange', function() {
            layerForm.loadRecord(layerRecord);
        });

        Ext.create('Ext.Viewport', {
            layout: "border",
            items: [{
                region: 'center',
                layout: 'fit',
                items: [{
                    xtype: 'gx_component_map',
                    map: new ol.Map({
                        layers: [
                            layer,
                            new ol.layer.Tile({
                                source: new ol.source.Stamen({
                                    layer: 'terrain-labels'
                                })
                            })
                        ],
                        view: view,
                        renderer: ['webgl', 'canvas', 'dom']
                    }),
                    listeners: {
                        boxready: function() {
                            // init forms with record data
                            viewForm.loadRecord(viewRecord);
                            layerForm.loadRecord(layerRecord);
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
                    {
                        title: 'Description',
                        contentEl: 'description'
                    }
                ]
            }]
        });
    }
});
