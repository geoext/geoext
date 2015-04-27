Ext.Loader.syncRequire(['GeoExt.data.LayerModel']);

describe('GeoExt.data.LayerModel', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.LayerModel).not.to.be(undefined);
        });
    });
});