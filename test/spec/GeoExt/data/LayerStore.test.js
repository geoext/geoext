Ext.Loader.syncRequire(['GeoExt.data.LayerStore']);

describe('GeoExt.data.LayerStore', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.LayerStore).not.to.be(undefined);
        });
    });
});
