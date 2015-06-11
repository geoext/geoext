Ext.Loader.syncRequire([
    'Ext.data.field.Field',
    'GeoExt.data.model.layer.Layer'
]);

describe('GeoExt.data.model.layer.Layer', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.model.layer.Layer).not.to.be(undefined);
        });
    });

    describe('constructor (no arguments)', function(){
        var instance;
        var fields;

        beforeEach(function() {
            instance = Ext.create('GeoExt.data.model.layer.Layer');
            fields = instance.getFields();
        });
        afterEach(function() {
            instance = null;
            fields = null;
        });

        it('can be constructed', function(){
            expect(instance).to.be.an(GeoExt.data.model.layer.Base);
            expect(instance).to.be.an(GeoExt.data.model.layer.Layer);
        });
        it('gives instances six fields', function(){
            expect(fields).to.be.an(Array);
            expect(fields.length).to.be(6);
        });
        it('provides instances with an source field', function(){
            var sourceField = Ext.Array.findBy(fields, function(field) {
                return field.name === "source";
            });
            expect(sourceField).not.to.be(null);
            expect(sourceField).to.be.a(Ext.data.field.Field);
        });

        it('returns undefined if no source set for layer', function(){
            expect(instance.get('source')).to.be(undefined);
        });
    });

    describe('constructor (with layer)', function(){
        var layer;
        var instance;

        beforeEach(function() {
            layer = new ol.layer.Tile({
                source: new ol.source.Stamen({
                    layer: 'watercolor'
                })
            });
            instance = Ext.create('GeoExt.data.model.layer.Layer', layer);
        });
        afterEach(function() {
            layer = null;
            instance = null;
        });

        it('can be constructed', function(){
            expect(instance).to.be.an(GeoExt.data.model.layer.Base);
            expect(instance).to.be.an(GeoExt.data.model.layer.Layer);
        });

        it('references the passed layer', function(){
            expect(instance.data).to.be(layer);
            expect(instance.getOlLayer()).to.be(layer);
        });

        it('references the passed source', function(){
            expect(instance.get('source')).to.be.an(ol.source.Stamen);
            expect(instance.get('source')).to.be(layer.getSource());
        });
    });
});
