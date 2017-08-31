Ext.Loader.syncRequire(['GeoExt.component.OverviewMap']);

describe('GeoExt.component.OverviewMap', function() {

    var giveDimensions = function(elem, cssOpts) {
        if (elem) {
            var css = Ext.apply({
                position: 'absolute',
                top: 0,
                left: '-1000px',
                width: '256px',
                height: '128px'
            }, cssOpts || {});
            Ext.iterate(css, function(cssKey, cssValue) {
                elem.style[cssKey] = cssValue;
            });
        }
    };

    var div;
    var ovDiv;
    var olMap;

    beforeEach(function() {
        div = document.createElement('div');
        giveDimensions(div);
        document.body.appendChild(div);
        ovDiv = document.createElement('div');
        giveDimensions(ovDiv);
        document.body.appendChild(ovDiv);
        olMap = new ol.Map({
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            }),
            target: div
        });
    });

    afterEach(function() {
        olMap.setTarget(null);
        document.body.removeChild(ovDiv);
        ovDiv = null;
        document.body.removeChild(div);
        div = null;
    });

    describe('basics', function() {
        it('GeoExt.component.OverviewMap is defined', function() {
            expect(GeoExt.component.OverviewMap).not.to.be(undefined);
        });

        describe('constructor', function() {
            it('cannot be constructed without parentMap', function() {
                expect(function() {
                    Ext.create('GeoExt.component.OverviewMap');
                }).to.throwException();
            });

            it('cannot be constructed when the parentMap is not an ol.Map',
                function() {
                    expect(function() {
                        Ext.create('GeoExt.component.OverviewMap', {
                            parentMap: 123
                        });
                    }).to.throwException();
                }
            );

            it('can be constructed with a parentMap', function() {
                var overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                    parentMap: olMap
                });
                expect(overviewMap).to.be.an(GeoExt.component.OverviewMap);
            });
        });
    });

    describe('layers of the overview', function() {
        it('takes the layers of the parentMap if no dedictated layers given',
            function() {
                var layer1 = new ol.layer.Tile({title: 'moehri'});
                var layer2 = new ol.layer.Tile({title: 'zwiebli'});

                olMap.addLayer(layer1);
                olMap.addLayer(layer2);

                var overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                    parentMap: olMap
                });

                var ovLayers = overviewMap.getLayers();
                // two layers plus extentlayer:
                expect(ovLayers).to.have.length(3);
                expect(ovLayers[0]).to.be(layer1);
                expect(ovLayers[1]).to.be(layer2);
            }
        );


        it('can be configured with dedicated layers', function() {
            var layer1 = new ol.layer.Tile({title: 'moehri'});
            var layer2 = new ol.layer.Tile({title: 'zwiebli'});

            olMap.addLayer(layer1);

            var overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap,
                layers: [layer2]
            });

            var ovLayers = overviewMap.getLayers();
            expect(ovLayers).to.have.length(2); // one layers plus extentlayer
            expect(ovLayers[0]).to.be(layer2);
        });
        it('does not throw if no layers can be found', function() {
            var overviewMap;
            expect(function() {
                overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                    parentMap: olMap
                });
            }).to.not.throwException();

            var ovLayers = overviewMap.getLayers();
            expect(ovLayers).to.have.length(1); // only extentlayer
        });
    });

    describe('view properties in sync', function() {
        var overviewMap;

        beforeEach(function() {
            olMap.addLayer(new ol.layer.Tile({title: 'moehri'}));
            overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap
            });
        });

        afterEach(function() {
            overviewMap.destroy();
            overviewMap = null;
        });

        it('syncs the center of the map and overview', function() {
            // in sync at before anything
            var mapCenter = olMap.getView().getCenter();
            var ovCenter = overviewMap.getMap().getView().getCenter();
            expect(mapCenter).to.eql(ovCenter);

            // change the mapCenter
            olMap.getView().setCenter([0.8, 15]);

            // still in sync?
            mapCenter = olMap.getView().getCenter();
            ovCenter = overviewMap.getMap().getView().getCenter();
            expect(mapCenter).to.eql(ovCenter);
        });

        it('syncs the resolution of the map and overview', function() {

            // in sync at before anything
            var mapResolution = olMap.getView().getResolution();
            var ovResolution = overviewMap.getMap().getView().getResolution();

            expect(mapResolution).to.eql(
                ovResolution / overviewMap.getMagnification()
            );

            // change the map resolution
            olMap.getView().setResolution(0.815);

            // still in sync?
            expect(mapResolution).to.eql(
                ovResolution / overviewMap.getMagnification()
            );
        });
    });

    describe('extent layer features can be styled', function() {
        var overviewMap;

        beforeEach(function() {
            olMap.addLayer(new ol.layer.Tile({title: 'moehri'}));
            overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap
            });
        });

        afterEach(function() {
            overviewMap.destroy();
            overviewMap = null;
        });

        it('has no default style', function() {
            var anchorFeature = overviewMap.anchorFeature;
            var boxFeature = overviewMap.boxFeature;

            expect(anchorFeature.getStyle()).to.be(null);
            expect(boxFeature.getStyle()).to.be(null);

        });

        it('can be configured with styles for box and anchor', function() {
            var style1 = new ol.style.Style();
            var style2 = new ol.style.Style();

            // rebuild the overviewMap:
            overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap,
                anchorStyle: style1,
                boxStyle: style2
            });

            var anchorFeature = overviewMap.anchorFeature;
            var boxFeature = overviewMap.boxFeature;

            expect(anchorFeature.getStyle()).to.be(style1);
            expect(boxFeature.getStyle()).to.be(style2);
        });

        it('changes the style via setters', function() {
            var style1 = new ol.style.Style();
            var style2 = new ol.style.Style();

            var anchorFeature = overviewMap.anchorFeature;
            var boxFeature = overviewMap.boxFeature;

            overviewMap.setAnchorStyle(style1);
            overviewMap.setBoxStyle(style2);

            expect(anchorFeature.getStyle()).to.be(style1);
            expect(boxFeature.getStyle()).to.be(style2);

        });
    });

    describe('dragging of extent box to recenter', function() {
        var overviewMap;

        beforeEach(function() {
            olMap.addLayer(new ol.layer.Tile({title: 'moehri'}));
            overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap,
                target: ovDiv
            });
        });

        afterEach(function() {
            overviewMap.destroy();
            overviewMap = null;
        });

        it('is enabled by default', function() {
            expect(overviewMap.getEnableBoxDrag()).to.be(true);
        });

        it('calls `destroyDragBehaviour` when set to `false`', function() {
            // setup
            var spy = sinon.spy(overviewMap, 'destroyDragBehaviour');

            overviewMap.setEnableBoxDrag(false);
            expect(spy.called).to.be(true);

            // teardown
            overviewMap.destroyDragBehaviour.restore();
        });

        it('calls `setupDragBehaviour` when set to `true`', function() {
            // setup
            var spy = sinon.spy(overviewMap, 'setupDragBehaviour');
            overviewMap.setEnableBoxDrag(false); // disable first

            overviewMap.setEnableBoxDrag(true);
            expect(spy.called).to.be(true);

            // teardown
            overviewMap.setupDragBehaviour.restore();
        });

        it('calls `destroyDragBehaviour` when component gets destroyed',
            function() {
                // setup
                var spy = sinon.spy(overviewMap, 'destroyDragBehaviour');

                overviewMap.destroy();
                expect(spy.called).to.be(true);

                // teardown
                overviewMap.destroyDragBehaviour.restore();
            }
        );

        describe('#setupDragBehaviour', function() {
            it('creates and adds a Translate interaction', function() {
                overviewMap.destroyDragBehaviour(); // destroy first
                var before = overviewMap.getMap().getInteractions().getLength();
                overviewMap.setupDragBehaviour(); // we test this call
                var after = overviewMap.getMap().getInteractions().getLength();
                expect(overviewMap.dragInteraction).to.not.be(null);
                expect(overviewMap.dragInteraction).to.be.a(
                    ol.interaction.Translate
                );
                expect(before + 1).to.be(after);
            });
        });

        describe('#destroyDragBehaviour', function() {
            it('nullifies and removes the Translate interaction', function() {
                overviewMap.destroyDragBehaviour(); // destroy first
                overviewMap.setupDragBehaviour();
                var before = overviewMap.getMap().getInteractions().getLength();
                overviewMap.destroyDragBehaviour(); // we test this call
                var after = overviewMap.getMap().getInteractions().getLength();

                expect(overviewMap.dragInteraction).to.be(null);
                expect(before - 1).to.be(after);
            });
        });

        describe('#repositionAnchorFeature', function() {
            it('updates the anchor geometry', function() {
                overviewMap.destroyDragBehaviour(); // destroy first
                overviewMap.setupDragBehaviour();
                overviewMap.boxFeature.setGeometry(ol.geom.Polygon.fromExtent(
                    [0, 0, 2, 2]
                ));
                overviewMap.repositionAnchorFeature();

                var anchorGeom = overviewMap.anchorFeature.getGeometry();
                var anchorCoords = anchorGeom.getCoordinates();
                expect(anchorCoords).to.eql([0, 0]);
            });
        });

        describe('#recenterParentFromBox', function() {
            it('updates the parent map center', function(done) {
                overviewMap.destroyDragBehaviour(); // destroy first
                overviewMap.setupDragBehaviour();
                overviewMap.boxFeature.setGeometry(ol.geom.Polygon.fromExtent(
                    [0, 0, 2, 2]
                ));
                overviewMap.recenterParentFromBox();

                setTimeout(function() {
                    var parentCenter = olMap.getView().getCenter();
                    expect(parentCenter).to.eql([1, 1]);
                    done();
                }, 1200);
            });

            it('reprojects if projections are not equal', function(done) {
                overviewMap.destroyDragBehaviour(); // destroy first
                overviewMap.setupDragBehaviour();
                overviewMap.boxFeature.setGeometry(ol.geom.Polygon.fromExtent(
                    [0, 0, 1000000, 1000000]
                    // --> center is [500000, 500000] in 3857, which is
                    // [4.491576420597607, 4.486983030705062] in 4326
                ));

                // set a different projection (4326) for the parent map
                // to force projection between overviewMap (3857) and
                // parentMap (4326)
                var newParentView = new ol.View({
                    center: [0, 0],
                    projection: 'EPSG:4326',
                    zoom: 2
                });
                olMap.setView(newParentView);

                // we test whether this call will reproject
                overviewMap.recenterParentFromBox();

                var expectedCenter = [4.491576420597607, 4.486983030705062];


                setTimeout(function() {
                    var parentCenter = olMap.getView().getCenter();

                    expect(
                        parentCenter[0].toFixed(12)
                    ).to.eql(
                        expectedCenter[0].toFixed(12)
                    );
                    expect(
                        parentCenter[1].toFixed(12)
                    ).to.eql(
                        expectedCenter[1].toFixed(12)
                    );
                    done();
                }, 1200);
            });
        });
    });

    describe('static functions', function() {
        var clazz = GeoExt.component.OverviewMap;
        describe('#getVisibleExtentGeometries', function() {
            it('is a defined function', function() {
                expect(clazz.getVisibleExtentGeometries).to.be.a('function');
            });
            it('returns undefined if not passed a map', function() {
                var got = clazz.getVisibleExtentGeometries();
                expect(got).to.be(undefined);
            });
            it('returns undefined if map has no size (unrendered)', function() {
                var got = clazz.getVisibleExtentGeometries(olMap);
                expect(got).to.be(undefined);
            });
            it('returns an object if map has size (rendered)', function() {
                olMap.renderSync();
                var got = clazz.getVisibleExtentGeometries(olMap);
                expect(got).to.not.be(undefined);
            });
            it('returns an object with keys "extent" & "topLeft"', function() {
                olMap.renderSync();
                var got = clazz.getVisibleExtentGeometries(olMap);
                expect(got.extent).to.not.be(undefined);
                expect(got.topLeft).to.not.be(undefined);
            });
            it('returns an extent as polygon', function() {
                olMap.renderSync();
                var got = clazz.getVisibleExtentGeometries(olMap);
                expect(got.extent).to.be.a(ol.geom.Polygon);
            });
            it('returns a topLeft as point', function() {
                olMap.renderSync();
                var got = clazz.getVisibleExtentGeometries(olMap);
                expect(got.topLeft).to.be.a(ol.geom.Point);
            });
            it('returns a correctly rotated polygon', function() {
                olMap.renderSync();
                var angle = Math.PI / 4;
                var before = clazz.getVisibleExtentGeometries(olMap).extent;
                var center = ol.extent.getCenter(before.getExtent());
                var manually = before.clone();
                manually.rotate(angle, center);
                var manuallyCoords = manually.getCoordinates()[0];

                // now rotate the parent map
                olMap.getView().setRotation(angle);
                olMap.renderSync();
                var afterViewRotated = clazz.getVisibleExtentGeometries(olMap);
                var autoRotated = afterViewRotated.extent;
                var autoRotatedCoords = autoRotated.getCoordinates()[0];

                var precision = 8;
                Ext.each(autoRotatedCoords, function(autoRotatedCoord, i) {
                    var manualCoord = manuallyCoords[i];
                    // x-coordinate
                    expect(
                        autoRotatedCoord[0].toFixed(precision)
                    ).to.be(
                        manualCoord[0].toFixed(precision)
                    );
                    // y-coordinate
                    expect(
                        autoRotatedCoord[1].toFixed(precision)
                    ).to.be(
                        manualCoord[1].toFixed(precision)
                    );
                });
            });
        });
    });

});
