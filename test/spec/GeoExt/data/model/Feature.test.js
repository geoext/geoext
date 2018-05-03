Ext.Loader.syncRequire(['GeoExt.data.model.Feature']);

describe('GeoExt.data.model.Feature', function() {

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.model.Feature).not.to.be(undefined);
        });
    });

    describe('constructor', function() {
        var feat;
        var rec;
        beforeEach(function() {
            feat = new ol.Feature();
            rec = Ext.create('GeoExt.data.model.Feature', feat);
        });
        afterEach(function() {
            rec = null;
            feat = null;
        });
        it('constucts an instance of GeoExt.data.model.Feature', function() {
            expect(rec).to.be.an(GeoExt.data.model.Feature);
        });
    });

    describe('#getFeature', function() {
        var feat;
        var rec;
        beforeEach(function() {
            feat = new ol.Feature();
            rec = Ext.create('GeoExt.data.model.Feature', feat);
        });
        afterEach(function() {
            rec = null;
            feat = null;
        });
        it('is defined', function() {
            expect(rec.getFeature).not.to.be(undefined);
        });
        it('returnes the correct feature', function() {
            expect(rec.getFeature()).to.be(feat);
        });
    });
});
