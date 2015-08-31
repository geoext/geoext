Ext.Loader.syncRequire([
    'Ext.data.field.Field',
    'GeoExt.data.model.Layer'
]);

describe('GeoExt.data.model.Layer', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.model.Layer).not.to.be(undefined);
        });
    });

    describe('constructor (no arguments)', function(){
        var instance;
        var fields;

        beforeEach(function() {
            instance = Ext.create('GeoExt.data.model.Layer');
            fields = instance.getFields();
        });
        afterEach(function() {
            instance = null;
            fields = null;
        });

        it('can be constructed', function(){
            expect(instance).to.be.an(GeoExt.data.model.Layer);
        });
        it('gives instances six fields', function(){
            expect(fields).to.be.an(Array);
            expect(fields.length).to.be(6); // 5 defined in class + id
        });
        it('provides instances with an inherited id field', function(){
            var idField = Ext.Array.findBy(fields, function(field) {
                return field.name === "id";
            });
            expect(idField).not.to.be(null);
            expect(idField).to.be.a(Ext.data.field.Field);
        });
        it('provides instances a field for opacity', function(){
            var opacityField = Ext.Array.findBy(fields, function(field) {
                return field.name === "opacity";
            });
            expect(opacityField).not.to.be(null);
            expect(opacityField).to.be.a(Ext.data.field.Field);
        });
        it('provides instances a field for minResolution', function(){
            var minResField = Ext.Array.findBy(fields, function(field) {
                return field.name === "id";
            });
            expect(minResField).not.to.be(null);
            expect(minResField).to.be.a(Ext.data.field.Field);
        });
        it('provides instances a field for maxResolution', function(){
            var maxResField = Ext.Array.findBy(fields, function(field) {
                return field.name === "id";
            });
            expect(maxResField).not.to.be(null);
            expect(maxResField).to.be.a(Ext.data.field.Field);
        });
    });

    describe('constructor (with layer)', function(){
        var layer;
        var instance;

        beforeEach(function() {
            layer = new ol.layer.Tile();
            instance = Ext.create('GeoExt.data.model.Layer', layer);
        });
        afterEach(function() {
            layer = null;
            instance = null;
        });

        it('can be constructed', function(){
            expect(instance).to.be.an(GeoExt.data.model.Layer);
        });

        it('references the passed layer', function(){
            expect(instance.data).to.be(layer);
        });
    });

    describe('#getOlLayer', function(){
        var layer;
        var instance;

        beforeEach(function() {
            layer = new ol.layer.Tile();
            instance = Ext.create('GeoExt.data.model.Layer', layer);
        });
        afterEach(function() {
            layer = null;
            instance = null;
        });

        it('provides a getter for the layer', function(){
            expect(instance.getOlLayer).to.be.a(Function);
        });
        it('returns the passed layer', function(){
            expect(instance.getOlLayer()).to.be(layer);
        });
    });

    describe('properties are read out of the layer', function(){
        var layer;
        var instance;

        beforeEach(function() {
            layer = new ol.layer.Tile({
                opacity: 0.123,
                visible: false,
                minResolution: 12,
                maxResolution: 99
            });
            instance = Ext.create('GeoExt.data.model.Layer', layer);
        });
        afterEach(function() {
            layer = null;
            instance = null;
        });

        it('reads out the layers "opacity"', function(){
            expect(instance.get('opacity')).to.be(0.123);
        });
        it('reads out the layers "minResolution"', function(){
            expect(instance.get('minResolution')).to.be(12);
        });
        it('reads out the layers "maxResolution"', function(){
            expect(instance.get('maxResolution')).to.be(99);
        });
    });

    describe('getters return undefined if no layer', function(){
        var instance;

        beforeEach(function() {
            instance = Ext.create('GeoExt.data.model.Layer');
        });
        afterEach(function() {
            instance = null;
        });

        it('returns "undefined" for "opacity" if no layer was passed',
            function(){
                expect(instance.get('opacity')).to.be(undefined);
            }
        );
        it('returns "undefined" for "minResolution" if no layer was passed',
            function(){
                expect(instance.get('minResolution')).to.be(undefined);
            }
        );
        it('returns "undefined" for "maxResolution" if no layer was passed',
            function(){
                expect(instance.get('maxResolution')).to.be(undefined);
            }
        );
    });
});
