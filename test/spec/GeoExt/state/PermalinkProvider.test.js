Ext.Loader.syncRequire(['GeoExt.state.PermalinkProvider']);

describe('GeoExt.state.PermalinkProvider', function() {

    describe('basics', function() {
        it('GeoExt.state.PermalinkProvider is defined', function() {
            expect(GeoExt.state.PermalinkProvider).not.to.be(undefined);
        });

        describe('constructor', function() {
            it('can be constructed wo/ arguments via Ext.create()', function() {
                var plProvider = Ext.create('GeoExt.state.PermalinkProvider');
                expect(plProvider).to.be.an(GeoExt.state.PermalinkProvider);
            });
        });
    });

    describe('public functions', function() {
        var plProvider;

        beforeEach(function() {
            plProvider = Ext.create('GeoExt.state.PermalinkProvider');
        });

        afterEach(function() {
            plProvider.destroy();
        });
        describe('readPermalinkHash()', function() {

            it('returns a correct state object',
                function() {
                    var state = plProvider.readPermalinkHash(
                        '#map=8/-1061011/6804570.83/0');
                    expect(state).to.be.an(Object);
                    expect(state.zoom).to.be(8);
                    expect(state.center).to.be.an(Array);
                    expect(state.center[0]).to.be(-1061011);
                    expect(state.center[1]).to.be(6804570.83);
                    expect(state.rotation).to.be(0);
                }
            );

        });

        describe('getPermalinkHash()', function() {

            it('returns a correct URL hash',
                function() {
                    var state = {
                        zoom: 8,
                        center: [-1061011.123456, 6804570.9876],
                        rotation: 0
                    };
                    plProvider.mapState = state;

                    var hash = plProvider.getPermalinkHash();
                    expect(hash).to.be('#map=8/-1061011.123456/6804570.9876/0');
                }
            );

            it('rounds the coordinates if correspondig param is set',
                function() {
                    var state = {
                        zoom: 8,
                        center: [-1061011.123456, 6804570.9876],
                        rotation: 0
                    };
                    plProvider.mapState = state;

                    var hash = plProvider.getPermalinkHash(true);
                    expect(hash).to.be('#map=8/-1061011.12/6804570.99/0');
                }
            );

        });

        describe('set()', function() {

            it('keep our mapState object in sync with the state',
                function() {
                    var state = {
                        zoom: 8,
                        center: [-1061011.123456, 6804570.9876],
                        rotation: 0
                    };
                    plProvider.set('foo', state);

                    // var hash = plProvider.getPermalinkHash();
                    expect(plProvider.mapState).to.be(state);
                }
            );

        });

    });

});
