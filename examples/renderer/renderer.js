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

Ext.require([
    'GeoExt.component.FeatureRenderer'
]);


Ext.application({
    name: 'FeatureRenderer GeoExt2',
    launch: function() {
       Ext.create("GeoExt.component.FeatureRenderer", {renderTo: 'line_default', symbolType: "Line"}); 
       Ext.create("GeoExt.component.FeatureRenderer", {renderTo: 'line_red', symbolizers: red, symbolType: "Line"});
       Ext.create("GeoExt.component.FeatureRenderer", {renderTo: 'point_default', symbolType: "Point"});
       Ext.create("GeoExt.component.FeatureRenderer", {renderTo: 'point_red', symbolizers: red, symbolType: "Point"});
       Ext.create("GeoExt.component.FeatureRenderer", {renderTo: 'poly_default', symbolType: "Polygon"});
       Ext.create("GeoExt.component.FeatureRenderer", {renderTo: 'poly_red', symbolizers: red, symbolType: "Polygon"});
    }
});
