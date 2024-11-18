Ext.Loader.syncRequire(['GeoExt.component.OverviewMap']);

describe('GeoExt.component.OverviewMap', function () {
  const giveDimensions = function (elem, cssOpts) {
    if (elem) {
      const css = Ext.apply(
        {
          position: 'absolute',
          top: 0,
          left: '-1000px',
          width: '256px',
          height: '128px',
        },
        cssOpts || {},
      );
      Ext.iterate(css, function (cssKey, cssValue) {
        elem.style[cssKey] = cssValue;
      });
    }
  };

  let div;
  let ovDiv;
  let olMap;

  beforeEach(function () {
    div = document.createElement('div');
    giveDimensions(div);
    document.body.appendChild(div);
    ovDiv = document.createElement('div');
    giveDimensions(ovDiv);
    document.body.appendChild(ovDiv);
    olMap = new ol.Map({
      view: new ol.View({
        center: [0, 0],
        zoom: 2,
      }),
      target: div,
    });
  });

  afterEach(function () {
    olMap.setTarget(null);
    document.body.removeChild(ovDiv);
    ovDiv = null;
    document.body.removeChild(div);
    div = null;
  });

  describe('basics', function () {
    it('GeoExt.component.OverviewMap is defined', function () {
      expect(GeoExt.component.OverviewMap).not.to.be(undefined);
    });

    describe('constructor', function () {
      it('cannot be constructed without parentMap', function () {
        expect(function () {
          Ext.create('GeoExt.component.OverviewMap');
        }).to.throwException();
      });

      it('cannot be constructed when the parentMap is not an ol.Map', function () {
        expect(function () {
          Ext.create('GeoExt.component.OverviewMap', {
            parentMap: 123,
          });
        }).to.throwException();
      });

      it('can be constructed with a parentMap', function () {
        const overviewMap = Ext.create('GeoExt.component.OverviewMap', {
          parentMap: olMap,
        });
        expect(overviewMap).to.be.an(GeoExt.component.OverviewMap);
      });
    });
  });

  describe('layers of the overview', function () {
    it('cannot take the layers of the parentMap as parameters', function () {
      const layer1 = new ol.layer.Tile({title: 'moehri'});
      const layer2 = new ol.layer.Tile({title: 'zwiebli'});

      olMap.addLayer(layer1);
      olMap.addLayer(layer2);

      expect(function () {
        Ext.create('GeoExt.component.OverviewMap', {
          parentMap: olMap,
          layers: [layer1, layer2],
        });
      }).to.throwException();
    });

    it('can be configured with dedicated layers', function () {
      const layer1 = new ol.layer.Tile({title: 'moehri'});
      const layer2 = new ol.layer.Tile({title: 'zwiebli'});

      olMap.addLayer(layer1);

      const overviewMap = Ext.create('GeoExt.component.OverviewMap', {
        parentMap: olMap,
        layers: [layer2],
      });

      const ovLayers = overviewMap.getLayers();
      expect(ovLayers).to.have.length(2); // one layers plus extentlayer
      expect(ovLayers[0]).to.be(layer2);
    });
    it('does not throw if no layers can be found', function () {
      let overviewMap;
      expect(function () {
        overviewMap = Ext.create('GeoExt.component.OverviewMap', {
          parentMap: olMap,
        });
      }).to.not.throwException();

      const ovLayers = overviewMap.getLayers();
      expect(ovLayers).to.have.length(1); // only extentlayer
    });
  });

  describe('view properties in sync', function () {
    let overviewMap;

    beforeEach(function () {
      olMap.addLayer(new ol.layer.Tile({title: 'moehri'}));
      overviewMap = Ext.create('GeoExt.component.OverviewMap', {
        parentMap: olMap,
      });
    });

    afterEach(function () {
      overviewMap.destroy();
      overviewMap = null;
    });

    it('syncs the center of the map and overview', function () {
      // in sync at before anything
      let mapCenter = olMap.getView().getCenter();
      let ovCenter = overviewMap.getMap().getView().getCenter();
      expect(mapCenter).to.eql(ovCenter);

      // change the mapCenter
      olMap.getView().setCenter([0.8, 15]);

      // still in sync?
      mapCenter = olMap.getView().getCenter();
      ovCenter = overviewMap.getMap().getView().getCenter();
      expect(mapCenter).to.eql(ovCenter);
    });

    it('syncs the resolution of the map and overview', function () {
      // in sync at before anything
      const mapResolution = olMap.getView().getResolution();
      const ovResolution = overviewMap.getMap().getView().getResolution();

      expect(mapResolution).to.eql(
        ovResolution / overviewMap.getMagnification(),
      );

      // change the map resolution
      olMap.getView().setResolution(0.815);

      // still in sync?
      expect(mapResolution).to.eql(
        ovResolution / overviewMap.getMagnification(),
      );
    });
  });

  describe('extent layer features can be styled', function () {
    let overviewMap;

    beforeEach(function () {
      olMap.addLayer(new ol.layer.Tile({title: 'moehri'}));
      overviewMap = Ext.create('GeoExt.component.OverviewMap', {
        parentMap: olMap,
      });
    });

    afterEach(function () {
      overviewMap.destroy();
      overviewMap = null;
    });

    it('has no default style', function () {
      const anchorFeature = overviewMap.anchorFeature;
      const boxFeature = overviewMap.boxFeature;

      expect(anchorFeature.getStyle()).to.be(null);
      expect(boxFeature.getStyle()).to.be(null);
    });

    it('can be configured with styles for box and anchor', function () {
      const style1 = new ol.style.Style();
      const style2 = new ol.style.Style();

      // rebuild the overviewMap:
      overviewMap = Ext.create('GeoExt.component.OverviewMap', {
        parentMap: olMap,
        anchorStyle: style1,
        boxStyle: style2,
      });

      const anchorFeature = overviewMap.anchorFeature;
      const boxFeature = overviewMap.boxFeature;

      expect(anchorFeature.getStyle()).to.be(style1);
      expect(boxFeature.getStyle()).to.be(style2);
    });

    it('changes the style via setters', function () {
      const style1 = new ol.style.Style();
      const style2 = new ol.style.Style();

      const anchorFeature = overviewMap.anchorFeature;
      const boxFeature = overviewMap.boxFeature;

      overviewMap.setAnchorStyle(style1);
      overviewMap.setBoxStyle(style2);

      expect(anchorFeature.getStyle()).to.be(style1);
      expect(boxFeature.getStyle()).to.be(style2);
    });
  });

  describe('dragging of extent box to recenter', function () {
    let overviewMap;

    beforeEach(function () {
      olMap.addLayer(new ol.layer.Tile({title: 'moehri'}));
      overviewMap = Ext.create('GeoExt.component.OverviewMap', {
        parentMap: olMap,
        target: ovDiv,
      });
    });

    afterEach(function () {
      overviewMap.destroy();
      overviewMap = null;
    });

    it('is enabled by default', function () {
      expect(overviewMap.getEnableBoxDrag()).to.be(true);
    });

    it('calls `destroyDragBehaviour` when set to `false`', function () {
      // setup
      const spy = sinon.spy(overviewMap, 'destroyDragBehaviour');

      overviewMap.setEnableBoxDrag(false);
      expect(spy.called).to.be(true);

      // teardown
      overviewMap.destroyDragBehaviour.restore();
    });

    it('calls `setupDragBehaviour` when set to `true`', function () {
      // setup
      const spy = sinon.spy(overviewMap, 'setupDragBehaviour');
      overviewMap.setEnableBoxDrag(false); // disable first

      overviewMap.setEnableBoxDrag(true);
      expect(spy.called).to.be(true);

      // teardown
      overviewMap.setupDragBehaviour.restore();
    });

    it('calls `destroyDragBehaviour` when component gets destroyed', function () {
      // setup
      const spy = sinon.spy(overviewMap, 'destroyDragBehaviour');

      overviewMap.destroy();
      expect(spy.called).to.be(true);

      // teardown
      overviewMap.destroyDragBehaviour.restore();
    });

    describe('#setupDragBehaviour', function () {
      it('creates and adds a Translate interaction', function () {
        overviewMap.destroyDragBehaviour(); // destroy first
        const before = overviewMap.getMap().getInteractions().getLength();
        overviewMap.setupDragBehaviour(); // we test this call
        const after = overviewMap.getMap().getInteractions().getLength();
        expect(overviewMap.dragInteraction).to.not.be(null);
        expect(overviewMap.dragInteraction).to.be.a(ol.interaction.Translate);
        expect(before + 1).to.be(after);
      });
    });

    describe('#destroyDragBehaviour', function () {
      it('nullifies and removes the Translate interaction', function () {
        overviewMap.destroyDragBehaviour(); // destroy first
        overviewMap.setupDragBehaviour();
        const before = overviewMap.getMap().getInteractions().getLength();
        overviewMap.destroyDragBehaviour(); // we test this call
        const after = overviewMap.getMap().getInteractions().getLength();

        expect(overviewMap.dragInteraction).to.be(null);
        expect(before - 1).to.be(after);
      });
    });

    describe('#repositionAnchorFeature', function () {
      it('updates the anchor geometry', function () {
        overviewMap.destroyDragBehaviour(); // destroy first
        overviewMap.setupDragBehaviour();
        overviewMap.boxFeature.setGeometry(
          ol.geom.Polygon.fromExtent([0, 0, 2, 2]),
        );
        overviewMap.repositionAnchorFeature();

        const anchorGeom = overviewMap.anchorFeature.getGeometry();
        const anchorCoords = anchorGeom.getCoordinates();
        expect(anchorCoords).to.eql([0, 0]);
      });
    });

    describe('#recenterParentFromBox', function () {
      it('updates the parent map center', function (done) {
        overviewMap.destroyDragBehaviour(); // destroy first
        overviewMap.setupDragBehaviour();
        overviewMap.boxFeature.setGeometry(
          ol.geom.Polygon.fromExtent([0, 0, 2, 2]),
        );
        overviewMap.recenterParentFromBox();

        setTimeout(function () {
          const parentCenter = olMap.getView().getCenter();
          expect(parentCenter).to.eql([1, 1]);
          done();
        }, 1200);
      });

      it('reprojects if projections are not equal', function (done) {
        overviewMap.destroyDragBehaviour(); // destroy first
        overviewMap.setupDragBehaviour();
        overviewMap.boxFeature.setGeometry(
          ol.geom.Polygon.fromExtent(
            [0, 0, 1000000, 1000000],
            // --> center is [500000, 500000] in 3857, which is
            // [4.491576420597607, 4.486983030705062] in 4326
          ),
        );

        // set a different projection (4326) for the parent map
        // to force projection between overviewMap (3857) and
        // parentMap (4326)
        const newParentView = new ol.View({
          center: [0, 0],
          projection: 'EPSG:4326',
          zoom: 2,
        });
        olMap.setView(newParentView);

        // we test whether this call will reproject
        overviewMap.recenterParentFromBox();

        const expectedCenter = [4.491576420597607, 4.486983030705062];

        setTimeout(function () {
          const parentCenter = olMap.getView().getCenter();

          expect(parentCenter[0].toFixed(12)).to.eql(
            expectedCenter[0].toFixed(12),
          );
          expect(parentCenter[1].toFixed(12)).to.eql(
            expectedCenter[1].toFixed(12),
          );
          done();
        }, 1200);
      });
    });
  });

  describe('static functions', function () {
    const clazz = GeoExt.component.OverviewMap;
    describe('#getVisibleExtentGeometries', function () {
      it('is a defined function', function () {
        expect(clazz.getVisibleExtentGeometries).to.be.a('function');
      });
      it('returns undefined if not passed a map', function () {
        const got = clazz.getVisibleExtentGeometries();
        expect(got).to.be(undefined);
      });
      it('returns undefined if map has no size (unrendered)', function () {
        const got = clazz.getVisibleExtentGeometries(olMap);
        expect(got).to.be(undefined);
      });
      it('returns an object if map has size (rendered)', function () {
        olMap.renderSync();
        const got = clazz.getVisibleExtentGeometries(olMap);
        expect(got).to.not.be(undefined);
      });
      it('returns an object with keys "extent" & "topLeft"', function () {
        olMap.renderSync();
        const got = clazz.getVisibleExtentGeometries(olMap);
        expect(got.extent).to.not.be(undefined);
        expect(got.topLeft).to.not.be(undefined);
      });
      it('returns an extent as polygon', function () {
        olMap.renderSync();
        const got = clazz.getVisibleExtentGeometries(olMap);
        expect(got.extent).to.be.a(ol.geom.Polygon);
      });
      it('returns a topLeft as point', function () {
        olMap.renderSync();
        const got = clazz.getVisibleExtentGeometries(olMap);
        expect(got.topLeft).to.be.a(ol.geom.Point);
      });
      it('returns a correctly rotated polygon', function () {
        olMap.renderSync();
        const angle = Math.PI / 4;
        const before = clazz.getVisibleExtentGeometries(olMap).extent;
        const center = ol.extent.getCenter(before.getExtent());
        const manually = before.clone();
        manually.rotate(angle, center);
        const manuallyCoords = manually.getCoordinates()[0];

        // now rotate the parent map
        olMap.getView().setRotation(angle);
        olMap.renderSync();
        const afterViewRotated = clazz.getVisibleExtentGeometries(olMap);
        const autoRotated = afterViewRotated.extent;
        const autoRotatedCoords = autoRotated.getCoordinates()[0];

        const precision = 8;
        Ext.each(autoRotatedCoords, function (autoRotatedCoord, i) {
          const manualCoord = manuallyCoords[i];
          // x-coordinate
          expect(autoRotatedCoord[0].toFixed(precision)).to.be(
            manualCoord[0].toFixed(precision),
          );
          // y-coordinate
          expect(autoRotatedCoord[1].toFixed(precision)).to.be(
            manualCoord[1].toFixed(precision),
          );
        });
      });
    });
  });
});
