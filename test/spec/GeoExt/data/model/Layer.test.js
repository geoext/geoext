Ext.Loader.syncRequire([
    'Ext.data.field.Field',
    'GeoExt.data.model.Layer'
]);

describe('A GeoExt.data.model.Layer', function() {

    it('class is defined', function() {
        expect(GeoExt.data.model.Layer).not.to.be(undefined);
    });

    it('provides a getter for the underlying layer', function() {
        var layer = new ol.layer.Tile();
        var instance = Ext.create('GeoExt.data.model.Layer', layer);
        expect(instance.getOlLayer).to.be.a(Function);
    });

    it('provides a getter for the underlying layers properties', function() {
        var layer = new ol.layer.Tile({name: 'title'});
        var instance = Ext.create('GeoExt.data.model.Layer', layer);
        expect(instance.getOlLayerProp('none')).to.be(undefined);
        expect(instance.getOlLayerProp('none', 'default')).to.be('default');
        expect(instance.getOlLayerProp('name')).to.be('title');
        expect(instance.getOlLayerProp('name'), 'default').to.be('title');
    });

    describe('that has been created with no arguments', function() {
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

        it('is of expected type', function() {
            expect(instance).to.be.an(GeoExt.data.model.Layer);
        });
        it('has predefined fields', function() {
            expect(fields).to.be.an(Array);
            expect(fields.length).to.be(8); // 7 defined in class + id
        });
        it('provides instances with an inherited id field', function() {
            var idField = Ext.Array.findBy(fields, function(field) {
                return field.name === 'id';
            });
            expect(idField).not.to.be(null);
            expect(idField).to.be.a(Ext.data.field.Field);
        });
        it('provides instances a field for opacity', function() {
            var opacityField = Ext.Array.findBy(fields, function(field) {
                return field.name === 'opacity';
            });
            expect(opacityField).not.to.be(null);
            expect(opacityField).to.be.a(Ext.data.field.Field);
        });
        it('provides instances a field for minResolution', function() {
            var minResField = Ext.Array.findBy(fields, function(field) {
                return field.name === 'id';
            });
            expect(minResField).not.to.be(null);
            expect(minResField).to.be.a(Ext.data.field.Field);
        });
        it('provides instances a field for maxResolution', function() {
            var maxResField = Ext.Array.findBy(fields, function(field) {
                return field.name === 'id';
            });
            expect(maxResField).not.to.be(null);
            expect(maxResField).to.be.a(Ext.data.field.Field);
        });
    });

    describe('that has been created from a layer', function() {
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

        it('is of expected type', function() {
            expect(instance).to.be.an(GeoExt.data.model.Layer);
        });

        it('references the passed layer', function() {
            expect(instance.data).to.be(layer);
        });
    });

    describe('that is created from a layer', function() {

        it('has a default text field', function() {
            var layer = new ol.layer.Base({});
            var record = Ext.create('GeoExt.data.model.LayerTreeNode', layer);
            var name = record.unnamedLayerText;

            expect(record.get('text')).to.be(name);
        });

        it('has a defined name as a text field', function() {
            var name = 'test';
            var layer = new ol.layer.Base({name: name});
            var record = Ext.create('GeoExt.data.model.LayerTreeNode', layer);

            expect(record.get('text')).to.be(name);
        });

    });

    describe('that is created from a group layer', function() {

        it('has a default text field', function() {
            var layer = new ol.layer.Group({});
            var record = Ext.create('GeoExt.data.model.LayerTreeNode', layer);
            var name = record.unnamedGroupLayerText;

            expect(record.get('text')).to.be(name);
        });

        it('has a defined name as a text field', function() {
            var name = 'test';
            var layer = new ol.layer.Group({name: name});
            var record = Ext.create('GeoExt.data.model.LayerTreeNode', layer);

            expect(record.get('text')).to.be(name);
        });

    });

    describe('maps layer properties from the ol object', function() {
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

        it('mapping the layers "opacity"', function() {
            expect(instance.get('opacity')).to.be(0.123);
        });
        it('mapping the layers "minResolution"', function() {
            expect(instance.get('minResolution')).to.be(12);
        });
        it('mapping the layers "maxResolution"', function() {
            expect(instance.get('maxResolution')).to.be(99);
        });
    });

    describe('getters', function() {
        var instance;

        beforeEach(function() {
            instance = Ext.create('GeoExt.data.model.Layer');
        });
        afterEach(function() {
            instance = null;
        });

        it('return "undefined" for "opacity" if no layer was passed',
            function() {
                expect(instance.get('opacity')).to.be(undefined);
            }
        );
        it('return "undefined" for "minResolution" if no layer was passed',
            function() {
                expect(instance.get('minResolution')).to.be(undefined);
            }
        );
        it('return "undefined" for "maxResolution" if no layer was passed',
            function() {
                expect(instance.get('maxResolution')).to.be(undefined);
            }
        );
    });
});
