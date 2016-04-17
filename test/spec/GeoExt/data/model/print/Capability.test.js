describe('A GeoExt.data.model.print.Capability model', function() {

    var dataBasePath = (typeof __karma__ === 'undefined' ? '' : 'base/test/');
    var url = dataBasePath + 'data/PrintCapabilities.json';
    var data;

    function createFromRawData(props) {
        return Ext.create('GeoExt.data.model.print.Capability', props);
    }

    function loadFromRawData(props) {
        var recordProps = Ext.clone(props);
        return GeoExt.data.model.print.Capability.loadRawData(recordProps);
    }

    before(function(done) {
        Ext.syncRequire('GeoExt.data.model.print.Capability');
        Ext.Ajax.request({
            url: url,
            success: function(response) {
                data = Ext.decode(response.responseText);
            },
            failure: function(response) {
                Ext.raise('Could not retrieve test data. Code '
                    + response.status);
            },
            callback: function() {
                done();
            }
        });
    });

    describe('can be initialized with Ext.create', function() {
        var record;

        it('from no properties at all', function() {
            expect(createFromRawData).to.not.throwException();
            record = createFromRawData();
            expect(record).to.be.a(GeoExt.data.model.print.Capability);
            expect(record.get('app')).to.be('');
            expect(record.get('formats')).to.be.an('array');
            expect(record.get('formats')).to.be.empty();
        });

        it('yielding accessor for associated layout model', function() {
            expect(record.layouts).to.be.a('function');
            expect(record.layouts()).to.be.an(Ext.data.Store);
            expect(record.layouts().getCount()).to.be(0);
        });
    });

    describe('can be initialized with Ext.create', function() {
        var record;

        it('from a property map', function() {
            expect(createFromRawData)
                .withArgs(data).to.not.throwException();
            record = createFromRawData(data);
            expect(record).to.be.a(GeoExt.data.model.print.Capability);
            expect(record.get('app')).to.be('geoext');
            expect(record.get('formats')).to.be.an('array');
            expect(record.get('formats').length).to.be(6);
        });

        it('yielding accessor for associated layout model', function() {
            expect(record.layouts).to.be.a('function');
            expect(record.layouts()).to.be.an(Ext.data.Store);
        });

        it('but does not read nested associations data', function() {
            expect(record.layouts().getCount()).to.be(0);
        });
    });

    describe('can be initialized with static #loadRawData', function() {
        var record;

        it('from no properties at all', function() {
            expect(loadFromRawData).to.not.throwException();
            record = loadFromRawData();
            expect(record).to.be.a(GeoExt.data.model.print.Capability);
            expect(record.get('app')).to.be('');
            expect(record.get('formats')).to.be.an('array');
            expect(record.get('formats')).to.be.empty();
        });

        it('yielding accessor for associated layout model', function() {
            expect(record.layouts).to.be.a('function');
            expect(record.layouts()).to.be.an(Ext.data.Store);
            expect(record.layouts().getCount()).to.be(0);
        });
    });

    describe('can be initialized with static #loadRawData', function() {
        var record;

        it('from a property map', function() {
            expect(loadFromRawData).withArgs(data).to.not.throwException();
            record = loadFromRawData(data);
            expect(record).to.be.a(GeoExt.data.model.print.Capability);
            expect(record.get('app')).to.be('geoext');
            expect(record.get('formats')).to.be.an('array');
            expect(record.get('formats').length).to.be(6);
        });

        it('yielding accessor for associated layout model', function() {
            expect(record.layouts).to.be.a('function');
            expect(record.layouts()).to.be.an(Ext.data.Store);
        });

        it('and allows access to deeply nested assosciations data', function() {
            var layouts = record.layouts();
            var layout;
            var attributes;
            var attribute;

            expect(layouts.getAt(0))
                .to.be.a(GeoExt.data.model.print.Layout);
            layout = layouts.getAt(0);
            expect(layout.get('name')).to.be('A4 portrait');
            expect(layout.attributes()).to.be.an(Ext.data.Store);
            attributes = layout.attributes();
            expect(attributes.getAt(0))
                .to.be.a(GeoExt.data.model.print.LayoutAttribute);
            attribute = attributes.getAt(0);
            expect(attribute.get('name')).to.be('map');
        });
    });

    describe('can be loaded from a remote ressource', function() {
        var record;

        it('configuring the proxy on the Capability model', function(done) {
            GeoExt.data.model.print.Capability.getProxy().setUrl(url);
            GeoExt.data.model.print.Capability.load(null, {
                callback: function(r) {
                    expect(r).to.be.a(GeoExt.data.model.print.Capability);
                    expect(r.get('app')).to.be('geoext');
                    expect(r.get('formats')).to.be.an('array');
                    expect(r.get('formats').length).to.be(6);
                    record = r;
                    done();
                }
            });
        });

        it('yielding accessor for associated layout model', function() {
            expect(record.layouts).to.be.a('function');
            expect(record.layouts()).to.be.an(Ext.data.Store);
        });

        it('and allows access to deeply nested assosciations data', function() {
            var layouts = record.layouts();
            var layout;
            var attributes;
            var attribute;

            expect(layouts.getAt(0))
                .to.be.a(GeoExt.data.model.print.Layout);
            layout = layouts.getAt(0);
            expect(layout.get('name')).to.be('A4 portrait');
            expect(layout.attributes()).to.be.an(Ext.data.Store);
            attributes = layout.attributes();
            expect(attributes.getAt(0))
                .to.be.a(GeoExt.data.model.print.LayoutAttribute);
            attribute = attributes.getAt(0);
            expect(attribute.get('name')).to.be('map');
        });
    });
});
