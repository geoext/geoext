Ext.Loader.syncRequire(['GeoExt.component.FeatureRenderer']);

describe('GeoExt.component.FeatureRenderer', function() {

    describe('#constructor', function() {
        var renderer;
        beforeEach(function(){
            renderer = Ext.create('GeoExt.component.FeatureRenderer');
        });
        afterEach(function(){
            renderer.destroy();
        });
        it('should be a component', function() {
            expect(renderer).to.be.a(Ext.Component);
        });
        it('should have a feature set', function() {
            expect(renderer.getFeature()).not.to.be(undefined);
            expect(renderer.getFeature().getGeometry()).to.be.a(ol.geom.Polygon);
        });
    });

    describe('#drawFeature', function() {
        var renderer;
        beforeEach(function(){
            renderer = Ext.create('GeoExt.component.FeatureRenderer', {
                renderTo: document.body,
                symbolizers: new ol.style.Style({
                    fill: new ol.style.Fill({color: 'red'})
                })
            });
        });
        afterEach(function(){
            renderer.destroy();
        });
        it('should have the symbolizer set on the feature', function() {
            expect(renderer.getFeature().getStyle().getFill().getColor()).to.be('red');
        });
        it('should update the symbolizers', function() {
            renderer.update({
                symbolizers: new ol.style.Style({
                    fill: new ol.style.Fill({color: 'blue'})
                })
            });
            expect(renderer.getFeature().getStyle().getFill().getColor()).to.be('blue');
        });
        it('should update the feature', function() {
            expect(renderer.getFeature().getGeometry()).to.be.a(ol.geom.Polygon);
            renderer.update({
                feature: new ol.Feature({
                    geometry: new ol.geom.Point([0, 0])
                })
            });
            expect(renderer.getFeature().getGeometry()).to.be.a(ol.geom.Point);
            expect(renderer.getFeature().getStyle().getFill().getColor()).to.be('red');
        });
    });

});
