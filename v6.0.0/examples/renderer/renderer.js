var redStroke = new ol.style.Stroke({color: 'red', width: 2});
var redFill = new ol.style.Fill({color: [255, 0, 0, 0.25]});
var red = new ol.style.Style({
    stroke: redStroke,
    fill: redFill,
    image: new ol.style.Circle({
        stroke: redStroke,
        fill: redFill,
        radius: 5
    })
});

var custom = {
    point: new ol.style.Style({
        image: new ol.style.RegularShape({
            fill: new ol.style.Fill({color: 'yellow'}),
            stroke: new ol.style.Stroke({color: 'red', width: 1}),
            points: 5,
            radius: 8,
            radius2: 4,
            angle: 0
        })
    }),
    line: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#669900',
            width: 3
        })
    }),
    poly: new ol.style.Style({
        fill: new ol.style.Fill({
            color: [128, 128, 0, 0.25]
        }),
        stroke: new ol.style.Stroke({
            color: '#666666',
            width: 2,
            lineDash: [1.5, 7.5]
        })
    }),
    text: new ol.style.Style({
        text: new ol.style.Text({
            fill: new ol.style.Fill({color: '#FF0000'}),
            text: 'Ab'
        })
    })
};

var stacked = {
    point: [
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: 'white'
                }),
                stroke: new ol.style.Stroke({
                    color: 'red', width: 2
                })
            })
        }),
        new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({
                    color: 'red'
                }),
                stroke: new ol.style.Stroke({
                    color: 'black'
                }),
                points: 5,
                radius: 5,
                radius2: 2,
                angle: 0
            })
        })
    ],
    line: [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red', width: 5
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ff9933',
                width: 2
            })
        })
    ],
    poly: [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#669900',
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'white'
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2,
                lineDash: [1.5, 7.5]
            })
        })
    ],
    text: [
        new ol.style.Style({
            text: new ol.style.Text({
                fill: new ol.style.Fill({
                    color: '#FF0000'
                }),
                font: '18px Helvetica',
                text: 'Ab'
            })
        }),
        new ol.style.Style({
            text: new ol.style.Text({
                fill: new ol.style.Fill({
                    color: '#00FF00'
                }),
                text: 'Ab',
                font: '12px Helvetica'
            })
        })
    ]
};

var graphicText = {
    text: new ol.style.Style({
        text: new ol.style.Text({
            text: 'Ab',
            fill: new ol.style.Fill({color: '#FF0000'}),
            textAlgin: 'center',
            textBaseline: 'middle'
        })
    }),
    graphic: new ol.style.Style({
        image: new ol.style.RegularShape({
            stroke: new ol.style.Stroke({color: 'black'}),
            fill: new ol.style.Fill({color: 'yellow'}),
            points: 4,
            scale: 0.5,
            radius: 10,
            angle: Math.PI / 4
        })
    })
};

Ext.require([
    'GeoExt.component.FeatureRenderer'
]);

var format = new ol.format.WKT();
var renderer;
var win;

function render() {
    var wkt = document.getElementById('wkt').value;
    var feature;
    var symbolizers;
    var value;

    try {
        feature = format.readFeature(wkt);
    } catch (err) {
        document.getElementById('wkt').value = 'Bad WKT: ' + err;
    }

    try {
        value = document.getElementById('symbolizers').value;
        symbolizers = Ext.JSON.decode(value);
        if (!symbolizers) {
            throw 'Invalid symbolizers';
        }
    } catch (err) {
        document.getElementById('symbolizers').value = 'Bad symbolizers: ' +
            err + '\n\n' + value;
        symbolizers = null;
    }
    if (feature && symbolizers) {
        if (!win) {
            renderer = Ext.create('GeoExt.component.FeatureRenderer', {
                feature: feature,
                symbolizers: symbolizers,
                width: 150,
                style: {margin: 4}
            });
            win = Ext.create('Ext.Window', {
                closeAction: 'hide',
                layout: 'fit',
                width: 175,
                items: [renderer]
            });
        } else {
            renderer.update({
                feature: feature,
                symbolizers: symbolizers
            });
        }
        win.show();
    }
}

Ext.application({
    name: 'FeatureRenderer GeoExt2',
    launch: function() {
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'line_default',
            symbolType: 'Line'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'line_red',
            symbolizers: red,
            symbolType: 'Line'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'point_default',
            symbolType: 'Point'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'point_red',
            symbolizers: red,
            symbolType: 'Point'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'poly_default',
            symbolType: 'Polygon'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'poly_red',
            symbolizers: red,
            symbolType: 'Polygon'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'line_custom',
            symbolizers: custom.line,
            symbolType: 'Line'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'point_custom',
            symbolizers: custom.point,
            symbolType: 'Point'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'poly_custom',
            symbolizers: custom.poly,
            symbolType: 'Polygon'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'text_custom',
            symbolizers: custom.text,
            symbolType: 'Text'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'line_stacked',
            symbolizers: stacked.line,
            symbolType: 'Line'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'point_stacked',
            symbolizers: stacked.point,
            symbolType: 'Point'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'poly_stacked',
            symbolizers: stacked.poly,
            symbolType: 'Polygon'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'text_stacked',
            symbolizers: stacked.text,
            symbolType: 'Text'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'text-only',
            symbolizers: graphicText.text,
            symbolType: 'Text'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'graphic-only',
            symbolizers: graphicText.graphic,
            symbolType: 'Text'
        });
        Ext.create('GeoExt.component.FeatureRenderer', {
            renderTo: 'text-graphic',
            symbolizers: [
                graphicText.text,
                graphicText.graphic
            ],
            symbolType: 'Text'
        });
        Ext.get('render').dom.onclick = render;
    }
});
