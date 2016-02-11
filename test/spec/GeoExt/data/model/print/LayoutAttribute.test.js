describe('A GeoExt.data.model.print.LayoutAttribute', function() {
    var attribute;

    function create(props) {
        attribute =
            Ext.create('GeoExt.data.model.print.LayoutAttribute', props);
    }

    before(function() {
        Ext.syncRequire([
            'GeoExt.data.model.print.LayoutAttribute',
            'GeoExt.data.model.print.Layout'
        ]);
    });

    it('can be created without attributes', function() {
        expect(create).to.not.throwException();
        expect(attribute).to.be.a(GeoExt.data.model.print.LayoutAttribute);
        expect(attribute.get('name')).to.be('');
    });

    it('can be created with attributes', function() {
        var clientInfo = {
            height: 100,
            width: 100,
            dpiSuggestions: [
                100
            ],
            maxDPI: 100
        };

        expect(create).withArgs({
            name: 'attr1',
            type: 'MapAttributeValues',
            clientInfo: clientInfo
        }).to.not.throwException();
        expect(attribute).to.be.a(GeoExt.data.model.print.LayoutAttribute);
        expect(attribute.get('name')).to.be('attr1');
        expect(attribute.get('type')).to.be('MapAttributeValues');
        expect(attribute.get('clientInfo')).to.eql(clientInfo);
    });

    it('can access its empty parent relationship', function() {
        expect(attribute.getLayout).to.be.a('function');
        expect(attribute.getLayout()).to.be(null);
    });
});
