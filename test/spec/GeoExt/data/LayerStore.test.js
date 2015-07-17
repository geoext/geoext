Ext.Loader.syncRequire(['GeoExt.data.store.Layer']);

describe('GeoExt.data.store.Layer', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.store.Layer).not.to.be(undefined);
        });
    });
});
