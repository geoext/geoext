describe('A GeoExt.data.model.print.Layout', function() {

    var data = {
        'name': 'layoutName',
        'attributes': [{
            'name': 'attributeName',
            'type': 'anAttribute',
            'clientParams': {}
        }]
    };

    function createFromRawData(props) {
        return Ext.create('GeoExt.data.model.print.Layout', props);
    }

    function loadFromRawData(props) {
        var recordProps = Ext.clone(props);
        return GeoExt.data.model.print.Layout.loadRawData(recordProps);
    }

    before(function() {
        Ext.syncRequire([
            'GeoExt.data.model.print.Layout',
            'GeoExt.data.model.print.Capability'
        ]);
    });

    describe('can be initialized with Ext.create', function() {
        var record;

        it('from no properties at all', function() {
            expect(createFromRawData).to.not.throwException();
            record = createFromRawData();
            expect(record).to.be.a(GeoExt.data.model.print.Layout);
            expect(record.get('name')).to.be('');
        });

        describe('yielding accessors to assosciated models', function() {
            it('for print capabilities (parent)', function() {
                expect(record.getCapability).to.be.a('function');
                expect(record.getCapability()).to.be(null);
            });

            it('for layout attributes (children)', function() {
                expect(record.attributes).to.be.a('function');
                expect(record.attributes()).to.be.an(Ext.data.Store);
                expect(record.attributes().getCount()).to.be(0);
            });
        });
    });

    describe('can be initialized with Ext.create', function() {
        var record;

        it('from a properties map', function() {
            expect(createFromRawData).withArgs(data).to.not.throwException();
            record = createFromRawData(data);
            expect(record).to.be.a(GeoExt.data.model.print.Layout);
            expect(record.get('name')).to.be('layoutName');
        });

        describe('yielding accessors to assosciated models', function() {
            it('for print capabilities (parent)', function() {
                expect(record.getCapability).to.be.a('function');
            });

            it('for layout attributes (children)', function() {
                expect(record.attributes).to.be.a('function');
            });
        });

        describe('but', function() {
            it('does not read nested associations data', function() {
                expect(record.getCapability()).to.be(null);
                expect(record.attributes()).to.be.an(Ext.data.Store);
                expect(record.attributes().getCount()).to.be(0);
            });
        });
    });

    describe('can be initialized with #loadRawData', function() {
        var record;

        it('from no properties at all', function() {
            expect(loadFromRawData).to.not.throwException();
            record = loadFromRawData();
            expect(record).to.be.a(GeoExt.data.model.print.Layout);
            expect(record.get('name')).to.be('');
        });

        describe('yielding accessors to assosciated models', function() {
            it('for print capabilities (parent)', function() {
                expect(record.getCapability).to.be.a('function');
                expect(record.getCapability()).to.be(null);
            });

            it('for layout attributes (children)', function() {
                expect(record.attributes).to.be.a('function');
                expect(record.attributes()).to.be.an(Ext.data.Store);
                expect(record.attributes().getCount()).to.be(0);
            });
        });
    });

    describe('can be initialized with #loadRawData', function() {
        var record;

        it('from a properties map', function() {
            expect(loadFromRawData).withArgs(data).to.not.throwException();
            record = loadFromRawData(data);
            expect(record).to.be.a(GeoExt.data.model.print.Layout);
            expect(record.get('name')).to.be('layoutName');
        });

        describe('yielding accessors to assosciated models', function() {
            it('for print capabilities (parent)', function() {
                expect(record.getCapability).to.be.a('function');
            });

            it('for layout attributes (children)', function() {
                expect(record.attributes).to.be.a('function');
            });
        });

        it('reading nested associations data', function() {
            var attribute;

            expect(record.getCapability()).to.be(null); // no parent defined
            expect(record.attributes()).to.be.an(Ext.data.Store);
            expect(record.attributes().getCount()).to.be(1);
            attribute = record.attributes().getAt(0);
            expect(attribute)
                .to.be.a(GeoExt.data.model.print.LayoutAttribute);
            expect(attribute.get('name')).to.be('attributeName');
            expect(attribute.get('type')).to.be('anAttribute');
            expect(attribute.get('clientParams')).to.eql({});
        });
    });
});
