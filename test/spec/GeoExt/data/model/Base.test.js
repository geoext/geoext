Ext.Loader.syncRequire(['GeoExt.data.model']);

describe('GeoExt.data.model', function() {

    describe('data schema', function() {
        it('has id', function() {
            expect(GeoExt.data.model.Base.schema.id).not.to.be('default');
        });
    });

});
