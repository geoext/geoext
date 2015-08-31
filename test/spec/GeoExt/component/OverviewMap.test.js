Ext.Loader.syncRequire(['GeoExt.component.OverviewMap']);

describe('GeoExt.component.OverviewMap', function() {

    var div;

    beforeEach(function(){
        div = document.createElement('div');
        document.body.appendChild(div);
    });

    afterEach(function(){
        document.body.removeChild(div);
        div = null;
    });

    describe('basics', function(){
        it('GeoExt.component.OverviewMap is defined', function(){
            expect(GeoExt.component.OverviewMap).not.to.be(undefined);
        });

        describe('constructor', function(){
            it('cannot be constructed without parentMap', function(){
                expect(function(){
                    Ext.create('GeoExt.component.OverviewMap');
                }).to.throwException();
            });

            it('cannot be constructed when the parentMap is not an ol.Map',
                function(){
                    expect(function(){
                        Ext.create('GeoExt.component.OverviewMap', {
                            parentMap: 123
                        });
                    }).to.throwException();
                }
            );

            it('can be constructed with a parentMap', function(){
                var olMap = new ol.Map({
                    view: new ol.View({
                        center: [0, 0],
                        zoom: 2
                    }),
                    target: div
                });

                var overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                    parentMap: olMap
                });
                expect(overviewMap).to.be.an(GeoExt.component.OverviewMap);
            });
        });
    });

    describe('layers of the overview', function(){
        it('takes the layers of the parentMap if no dedictated layers given',
            function(){
                var layer1 = new ol.layer.Tile({ title: 'moehri' });
                var layer2 = new ol.layer.Tile({ title: 'zwiebli' });

                var olMap = new ol.Map({
                    view: new ol.View({
                        center: [0, 0],
                        zoom: 2
                    }),
                    layers: [layer1, layer2],
                    target: div
                });

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


        it('can be configured with dedicated layers', function(){
            var layer1 = new ol.layer.Tile({ title: 'moehri' });
            var layer2 = new ol.layer.Tile({ title: 'zwiebli' });

            var olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                }),
                layers: [layer1],
                target: div
            });

            var overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap,
                layers: [layer2]
            });

            var ovLayers = overviewMap.getLayers();
            expect(ovLayers).to.have.length(2); // one layers plus extentlayer
            expect(ovLayers[0]).to.be(layer2);
        });
        it('does not throw if no layers can be found', function(){
            var olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                }),
                target: div
            });

            var overviewMap;
            expect(function(){
                overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                    parentMap: olMap
                });
            }).to.not.throwException();

            var ovLayers = overviewMap.getLayers();
            expect(ovLayers).to.have.length(1); // only extentlayer
        });
    });

    describe('view properties in sync', function() {
        var olMap;
        var overviewMap;

        beforeEach(function() {
            olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                }),
                layers: [new ol.layer.Tile({ title: 'moehri' })],
                target: div
            });
            overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap
            });
        });

        afterEach(function() {
            overviewMap.destroy();
            olMap = null;
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
        var olMap;
        var overviewMap;

        beforeEach(function() {
            olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                }),
                layers: [new ol.layer.Tile({ title: 'moehri' })],
                target: div
            });
            overviewMap = Ext.create('GeoExt.component.OverviewMap', {
                parentMap: olMap
            });
        });

        afterEach(function() {
            overviewMap.destroy();
            olMap = null;
            overviewMap = null;
        });

        it('has no default style', function(){
            var anchorFeature = overviewMap.anchorFeature;
            var boxFeature = overviewMap.boxFeature;

            expect(anchorFeature.getStyle()).to.be(null);
            expect(boxFeature.getStyle()).to.be(null);

        });

        it('can be configured with styles for box and anchor', function(){
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

        it('changes the style via setters', function(){
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

    describe('static functions', function() {

        describe('#rotateCoordsAroundCoords', function() {
            var center;
            var coords;
            var expected;
            var center2;
            var coords2;
            var expected2;
            var rotation;

            beforeEach(function(){
                center = [0, 0];
                coords = [-15615167.634322086, 10997148.133444877];
                expected = [-17331393.46990493, -8024557.788953042];
                center2 = [-1104754.8263107014, 2093211.9255832366];
                coords2 = [-16719922.460632788, 13090360.059028113];
                expected2 = [-18436148.29621563, -5931345.863369805];
                rotation = Math.PI / 3;
            });

            it('gives the same result as ol.coordinate.rotate center == [0, 0]',
                function(){
                    var cls = GeoExt.component.OverviewMap;
                    var got = cls.rotateCoordsAroundCoords(
                        coords, center, rotation
                    );
                    expect(got).to.eql(expected);
                    var gotOl = ol.coordinate.rotate(coords, rotation);
                    expect(gotOl).to.eql(got);
                }
            );

            it('gives the correct result for center != [0, 0]',
                function(){
                    var cls = GeoExt.component.OverviewMap;
                    var got = cls.rotateCoordsAroundCoords(
                        coords2, center2, rotation
                    );
                    expect(got).to.eql(expected2);
                }
            );
        });

        describe('#rotateGeomAroundCoords', function(){

            var point;
            var point2;
            var line;
            var line2;
            var polygon;
            var polygon2;

            var center;
            var rotation;

            beforeEach(function(){
                point = new ol.geom.Point([0.8, 15]);
                point2 = point.clone();
                line = new ol.geom.LineString([ [0, 0], [69, 69] ]);
                line2 = line.clone();
                polygon = new ol.geom.Polygon([ [
                    [0, 0], [0, 10], [10, 10], [10, 0], [0, 0]
                ] ]);
                polygon2 = polygon.clone();

                center = [-7, 8];
                rotation = Math.PI / 6;
            });

            it('only rotates points and polygons, others returned unchanged',
                function(){
                    var cls = GeoExt.component.OverviewMap;
                    var rotatedPoint = cls.rotateGeomAroundCoords(
                        point, center, rotation
                    );
                    expect(rotatedPoint.getCoordinates()).to.not.eql(
                        point2.getCoordinates()
                    );

                    var rotatedLine = cls.rotateGeomAroundCoords(
                        line, center, rotation
                    );
                    expect(rotatedLine.getCoordinates()).to.eql(
                        line2.getCoordinates()
                    );

                    var rotatedPolygon = cls.rotateGeomAroundCoords(
                        polygon, center, rotation
                    );
                    expect(rotatedPolygon.getCoordinates()).to.not.eql(
                        polygon2.getCoordinates()
                    );

                }
            );

            it('changes the given points and polygons in place', function(){
                GeoExt.component.OverviewMap.rotateGeomAroundCoords(
                    point, center, rotation
                );
                expect(point.getCoordinates()).to.not.eql(
                    point2.getCoordinates()
                );

                GeoExt.component.OverviewMap.rotateGeomAroundCoords(
                    polygon, center, rotation
                );
                expect(polygon.getCoordinates()).to.not.eql(
                    polygon2.getCoordinates()
                );
            });

            it('rotates points correctly', function(){
                var expectedPoint = [ -3.7450018504813776, 17.96217782649107 ];
                GeoExt.component.OverviewMap.rotateGeomAroundCoords(
                    point, center, rotation
                );
                expect(point.getCoordinates()).to.eql(expectedPoint);
            });

            it('rotates polygons correctly', function(){
                var expectedPoly = [
                    [
                        [ 3.0621778264910713, 4.5717967697244895 ],
                        [ -1.9378221735089287, 13.232050807568877 ],
                        [ 6.722431864335459, 18.232050807568875 ],
                        [ 11.722431864335459, 9.57179676972449 ],
                        [ 3.0621778264910713, 4.5717967697244895 ]
                    ]
                ];

                GeoExt.component.OverviewMap.rotateGeomAroundCoords(
                    polygon, center, rotation
                );
                expect(polygon.getCoordinates()).to.eql(expectedPoly);
            });
        });
    });

});
