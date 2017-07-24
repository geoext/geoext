Ext.Loader.syncRequire(['GeoExt.component.Map']);

describe('GeoExt.component.Map', function() {

    describe('basics', function() {
        it('GeoExt.component.Map is defined', function() {
            expect(GeoExt.component.Map).not.to.be(undefined);
        });

        describe('constructor', function() {
            it('can be constructed wo/ arguments via Ext.create()', function() {
                var mapComponent = Ext.create('GeoExt.component.Map');
                expect(mapComponent).to.be.an(GeoExt.component.Map);
            });
        });
    });

    describe('public functions', function() {
        var layer;
        var map;
        var mapComponent;
        var testObjs;

        beforeEach(function() {
            layer = new ol.layer.Tile({
                source: new ol.source.OSM()
            });
            testObjs = TestUtil.setupTestObjects({
                mapOpts: {
                    layers: [layer],
                    view: new ol.View({
                        center: [0, 0],
                        zoom: 2
                    })
                }
            });

            map = testObjs.map;
            mapComponent = testObjs.mapComponent;
        });

        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });
        describe('getters and setters', function() {

            it('getCenter() returns an array with 2 numbers',
                function() {
                    expect(mapComponent.getCenter()).to.be.an(Array);
                    expect(mapComponent.getCenter()).to.have.length(2);
                    expect(mapComponent.getCenter()[0]).to.be.a('number');
                    expect(mapComponent.getCenter()[1]).to.be.a('number');
                }
            );

            it('getExtent() returns an array with 4 numbers',
                function() {
                    expect(mapComponent.getExtent()).to.be.an(Array);
                    expect(mapComponent.getExtent()).to.have.length(4);
                    expect(mapComponent.getExtent()[0]).to.be.a('number');
                    expect(mapComponent.getExtent()[1]).to.be.a('number');
                    expect(mapComponent.getExtent()[2]).to.be.a('number');
                    expect(mapComponent.getExtent()[3]).to.be.a('number');
                }
            );

            it('getLayers() returns an ol.Collection containing' +
                ' instances of ol.layers.Base',
            function() {
                var layers = mapComponent.getLayers();
                expect(layers).to.be.an(ol.Collection);
                layers.forEach(function(l) {
                    expect(l).to.be.an(ol.layer.Base);
                });
            }
            );

            it('getView() returns an ol.View instance', function() {
                expect(mapComponent.getView()).to.be.an(ol.View);
            });

            it('getStore() returns a GeoExt.data.store.Layers instance',
                function() {
                    expect(
                        mapComponent.getStore()
                    ).to.be.an(GeoExt.data.store.Layers);
                }
            );

            it('setCenter() sets the correct center', function() {
                var center = [1183893.8882437304, 7914041.721258021];
                mapComponent.setCenter(center);
                expect(map.getView().getCenter()).to.be(center);
            });

            it('setExtent() sets the correct center', function() {
                for (var i = 0; i < 10; i++) {
                    var x1 = Math.random() * 100;
                    var x2 = Math.random() * 100;
                    var y1 = x1 + Math.random() * 100;
                    var y2 = x2 + Math.random() * 100;
                    var extent = [x1, x2, y1, y2];
                    var expectedCenter = [
                        (extent[2] - (extent[2] - extent[0]) / 2).toFixed(3),
                        (extent[3] - (extent[3] - extent[1]) / 2).toFixed(3)
                    ];
                    mapComponent.setExtent(extent);
                    var olCenter = map.getView().getCenter();
                    var derivedCenter = [
                        olCenter[0].toFixed(3),
                        olCenter[1].toFixed(3)
                    ];
                    // comparing the extent is hard due to the unpredictable
                    // ol-code of fitextent and calculate extent methods,
                    // so we will use the center for comparison here
                    expect(derivedCenter).to.eql(expectedCenter);
                }
            });

            it('setView() sets the correct ol.View to the ol.Map',
                function() {
                    var view = new ol.View({
                        center: [0.8, 15],
                        zoom: 4
                    });
                    mapComponent.setView(view);
                    expect(map.getView()).to.be(view);
                }
            );
        });

        describe('layer handling', function() {
            it('addLayer() adds an ol.layer.Base to the ol.Map',
                function() {
                    var source2 = new ol.source.OSM();
                    var layer2 = new ol.layer.Tile({
                        source: source2
                    });
                    mapComponent.addLayer(layer2);
                    expect(map.getLayers().getArray()).to.contain(layer2);
                }
            );

            it('addLayer() throws error if no layer is passed',
                function() {
                    var nolayer = [
                        null,
                        undefined,
                        new ol.source.OSM(),
                        '',
                        map
                    ];

                    nolayer.forEach(function(oneLayer) {
                        expect(
                            mapComponent.addLayer
                        ).withArgs(oneLayer).to.throwException();
                    });

                }
            );

            it('removeLayer() removes an ol.layer.Base', function() {
                expect(map.getLayers().getArray()).to.contain(layer);
                mapComponent.removeLayer(layer);
                expect(map.getLayers().getArray()).to.not.contain(layer);
            });

            it('removeLayer() throws error if no layer is passed',
                function() {
                    var nolayer = [
                        null,
                        undefined,
                        new ol.source.OSM(),
                        '',
                        map
                    ];

                    nolayer.forEach(function(oneLayer) {
                        expect(
                            mapComponent.removeLayer
                        ).withArgs(oneLayer).to.throwException();
                    });

                }
            );
        });

        describe('listening to size changes', function() {

            it('ensure the map is updated when the size changes', function() {
                var spy = sinon.spy(map, 'updateSize');

                mapComponent.setSize(100, 100);

                expect(spy.called).to.be(true);
                expect(spy.callCount).to.be(1);

                // restore old method
                map.updateSize.restore();
            });

        });

        describe('pointerrest configuration', function() {
            it('is off by default', function() {
                expect(mapComponent.getPointerRest()).to.be(false);
            });
            it('when it is off, there is no buffered handler', function() {
                expect(mapComponent.bufferedPointerMove).to.be(Ext.emptyFn);
            });
            it('can be turned on (config)', function() {
                var testObjs2 = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        pointerRest: true
                    }
                });
                var mapComponent2 = testObjs2.mapComponent;

                expect(mapComponent2.getPointerRest()).to.be(true);
                expect(mapComponent2.bufferedPointerMove).to.not.be(
                    Ext.emptyFn
                );

                TestUtil.teardownTestObjects(testObjs2);
            });
            it('can be turned on (setter)', function() {
                // sanity check
                expect(mapComponent.getPointerRest()).to.be(false);
                mapComponent.setPointerRest(true);
                expect(mapComponent.getPointerRest()).to.be(true);
                expect(mapComponent.bufferedPointerMove).to.not.be(
                    Ext.emptyFn
                );
            });
            it('can be turned off', function() {
                // sanity checks
                expect(mapComponent.getPointerRest()).to.be(false);
                expect(mapComponent.bufferedPointerMove).to.be(Ext.emptyFn);
                // 1) enable it…
                mapComponent.setPointerRest(true);
                expect(mapComponent.bufferedPointerMove).to.not.be(Ext.emptyFn);
                // 2) …disable it…
                mapComponent.setPointerRest(false);
                // 3) … bufferedPointerMove is the emptyFn again
                expect(mapComponent.bufferedPointerMove).to.be(Ext.emptyFn);
            });
            it('ensures bufferedPointerMove calls unbuffered one',
                function(done) {
                    var spy = sinon.spy(mapComponent, 'unbufferedPointerMove');
                    mapComponent.setPointerRestInterval(50);
                    mapComponent.setPointerRest(true);

                    // call into the generated bufferedPointerMove
                    var mockOlEvt = {pixel: [0, 0]};
                    mapComponent.bufferedPointerMove(mockOlEvt);

                    setTimeout(function() {
                        expect(spy.called).to.be(true);
                        expect(spy.callCount).to.be(1);
                        mapComponent.unbufferedPointerMove.restore();
                        done();
                    }, 100); // interval plus a bit offset
                }
            );
            it('ensures changing the interval changes the buffered method',
                function() {
                    mapComponent.setPointerRest(true);
                    var oldBuffered = mapComponent.bufferedPointerMove;
                    mapComponent.setPointerRestInterval(50);
                    var newBuffered = mapComponent.bufferedPointerMove;
                    expect(newBuffered).to.not.be(oldBuffered);
                }
            );
        });

    });
});
