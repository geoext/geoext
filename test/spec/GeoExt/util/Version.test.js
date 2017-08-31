Ext.Loader.syncRequire(['GeoExt.util.Version']);

describe('GeoExt.util.Version', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.util.Version).not.to.be(undefined);
        });

    });

    describe('static methods', function() {

        describe('isOl3', function() {
            expect(GeoExt.util.Version.isOl3).not.to.be(undefined);

            var isOl3 = GeoExt.util.Version.isOl3();
            expect(isOl3).to.be.a('boolean');
        });

        describe('isOl4', function() {
            expect(GeoExt.util.Version.isOl4).not.to.be(undefined);

            var isOl4 = GeoExt.util.Version.isOl4();
            expect(isOl4).to.be.a('boolean');
        });
    });

});
