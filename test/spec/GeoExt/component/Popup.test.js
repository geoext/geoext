Ext.Loader.syncRequire(['GeoExt.component.Popup']);

describe('GeoExt.component.Popup', function() {

    describe('basics', function() {
        it('GeoExt.component.Popup is defined', function() {
            expect(GeoExt.component.Popup).not.to.be(undefined);
        });

        describe('constructor', function() {
            it('throws if no map component provided', function() {
                expect(function() {
                    Ext.create('GeoExt.component.Popup');
                }).to.throwException();
            });
        });
    });

});
