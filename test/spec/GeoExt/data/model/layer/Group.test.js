Ext.Loader.syncRequire([
    'Ext.data.field.Field',
    'GeoExt.data.model.layer.Group'
]);

describe('GeoExt.data.model.layer.Group', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.model.layer.Group).not.to.be(undefined);
        });
    });

    describe('constructor (no arguments)', function(){
        var instance;
        var fields;

        beforeEach(function() {
            instance = Ext.create('GeoExt.data.model.layer.Group');
            fields = instance.getFields();
        });
        afterEach(function() {
            instance = null;
            fields = null;
        });

        it('can be constructed', function(){
            expect(instance).to.be.an(GeoExt.data.model.layer.Base);
            expect(instance).to.be.an(GeoExt.data.model.layer.Group);
        });
        it('gives instances five fields', function(){
            expect(fields).to.be.an(Array);
            expect(fields.length).to.be(6);
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
            instance = Ext.create('GeoExt.data.model.layer.Group', layer);
        });
        afterEach(function() {
            layer = null;
            instance = null;
        });

        it('can be constructed', function(){
            expect(instance).to.be.an(GeoExt.data.model.layer.Base);
            expect(instance).to.be.an(GeoExt.data.model.layer.Group);
        });

        it('references the passed layer', function(){
            expect(instance.data).to.be(layer);
            expect(instance.getOlLayer()).to.be(layer);
        });
    });
});
