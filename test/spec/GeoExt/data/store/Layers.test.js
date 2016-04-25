Ext.Loader.syncRequire(['GeoExt.data.store.Layers']);

describe('GeoExt.data.store.Layers', function() {

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.store.Layers).not.to.be(undefined);
        });
    });
});
