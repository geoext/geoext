Ext.Loader.syncRequire(['GeoExt.data.store.LayersTree']);

describe('GeoExt.data.store.LayersTree', function () {
  let div;
  let treeDiv;
  let olMap;
  let mapComponent;
  let source;
  let layer;
  let treeStore;
  let treePanel;

  beforeEach(function () {
    div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '-1000px';
    div.style.width = '512px';
    div.style.height = '256px';
    document.body.appendChild(div);

    treeDiv = document.createElement('div');
    treeDiv.style.position = 'absolute';
    treeDiv.style.top = '0';
    treeDiv.style.left = '-1000px';
    treeDiv.style.width = '512px';
    treeDiv.style.height = '256px';
    document.body.appendChild(treeDiv);

    source = new ol.source.OSM();
    layer = new ol.layer.Tile({
      source: source,
      name: 'LAYERONE',
    });

    olMap = new ol.Map({
      target: div,
      layers: [layer],
      view: new ol.View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    mapComponent = Ext.create('GeoExt.component.Map', {
      map: olMap,
    });

    treeStore = Ext.create('GeoExt.data.store.LayersTree', {
      layerGroup: olMap.getLayerGroup(),
    });

    treePanel = Ext.create('Ext.tree.Panel', {
      store: treeStore,
      renderTo: treeDiv,
      rootVisible: false,
      flex: 1,
      border: false,
      viewConfig: {
        plugins: {ptype: 'treeviewdragdrop'},
      },
    });
  });

  afterEach(function () {
    treePanel.destroy();
    treeStore.removeAll();
    mapComponent.destroy();
    olMap = layer = source = null;
    document.body.removeChild(treeDiv);
    document.body.removeChild(div);
  });

  describe('basics', function () {
    it('is defined', function () {
      expect(GeoExt.data.store.LayersTree).not.to.be(undefined);
    });
  });

  describe('Instanciation', function () {
    it('can be created with ol.Map.getLayerGroup()', function () {
      const store = Ext.create('GeoExt.data.store.LayersTree', {
        layerGroup: olMap.getLayerGroup(),
      });
      expect(store).to.be.a(GeoExt.data.store.LayersTree);
      const firstChild = store.getRootNode().getChildAt(0);
      expect(firstChild.getOlLayer()).to.be.an(ol.layer.Tile);
      expect(firstChild.getOlLayer()).to.be(layer);
    });
  });

  describe('Listens to Map/LayerCollection events', function () {
    it('adds/removes listeners for ol.Collections', function () {
      const layer2 = new ol.layer.Tile({
        source: new ol.source.OSM({
          layer: 'hyb',
        }),
        name: 'LAYERZWO',
      });
      mapComponent.addLayer(layer2);

      const rootNode = treeStore.getRootNode();

      let treeNode = rootNode.getChildAt(0);
      const treeNode2 = rootNode.getChildAt(1);

      expect(treeNode.get('text')).to.be(layer2.get('name'));

      expect(treeNode2.get('text')).to.be(layer.get('name'));

      mapComponent.removeLayer(layer);
      treeNode = rootNode.getChildAt(0);
      expect(treeNode.get('text')).to.be(layer2.get('name'));
      expect(treeNode.isFirst()).to.be(true);
      expect(treeNode.isLast()).to.be(true);
    });

    it('does properly remove nested layer', function () {
      const layer2 = new ol.layer.Vector();

      const group = new ol.layer.Group({
        layers: [layer2],
      });

      mapComponent.addLayer(group);

      group.getLayers().remove(layer2);

      const rootNode = treeStore.getRootNode();
      const groupNode = rootNode.getChildAt(0);
      expect(groupNode.childNodes.length).to.be(0);
    });
  });

  describe('ordering', function () {
    const layers = [];
    let group;

    beforeEach(function () {
      for (let i = 0; i < 6; i++) {
        const vector = new ol.layer.Vector({name: 'layer' + i});
        layers.push(vector);
      }

      group = new ol.layer.Group({
        layers: layers,
        name: 'group',
      });
    });

    describe('with non inverseLayerOrder', function () {
      let mapComponent2;
      let groupNode;

      beforeEach(function () {
        const olMap2 = new ol.Map({
          view: new ol.View({
            center: [0, 0],
            zoom: 2,
          }),
        });

        mapComponent2 = Ext.create('GeoExt.component.Map', {
          map: olMap2,
        });

        mapComponent2.addLayer(group);

        const store = Ext.create('GeoExt.data.store.LayersTree', {
          layerGroup: olMap2.getLayerGroup(),
          inverseLayerOrder: false,
        });

        const rootNode = store.getRootNode();
        groupNode = rootNode.getChildAt(rootNode.childNodes.length - 1);
      });

      it('does properly order nested nodes', function () {
        expect(groupNode.get('text')).to.be(group.get('name'));

        for (let i = 0; i < 6; i++) {
          const layerNode = groupNode.getChildAt(i);
          const vector = layers[i];
          expect(layerNode.get('text')).to.be(vector.get('name'));
        }
      });

      it('does properly order inserted node', function () {
        const indexes = [0, 3, 5];

        for (let i = 0; i < indexes.length; i++) {
          const vector = new ol.layer.Vector({
            name: 'insertedLayer' + i,
          });
          group.getLayers().insertAt(indexes[i], vector);
          const layerNode = groupNode.getChildAt(indexes[i]);
          expect(layerNode.get('text')).to.be(vector.get('name'));
        }
      });

      it('does properly order appended node', function () {
        const vector = new ol.layer.Vector({name: 'appendedLayer'});

        group.getLayers().push(vector);
        const groupSize = groupNode.childNodes.length;
        const layerNode = groupNode.getChildAt(groupSize - 1);
        expect(layerNode.get('text')).to.be(vector.get('name'));
      });
    });

    describe('with inverseLayerOrder', function () {
      let groupNode;

      beforeEach(function () {
        mapComponent.addLayer(group);
        const rootNode = treeStore.getRootNode();
        groupNode = rootNode.getChildAt(0);
      });

      it('does properly order nested nodes', function () {
        expect(groupNode.get('text')).to.be(group.get('name'));

        for (let i = 0; i < 6; i++) {
          const layerNode = groupNode.getChildAt(i);
          const vector = layers[5 - i];
          expect(layerNode.get('text')).to.be(vector.get('name'));
        }
      });

      it('does properly order inserted node', function () {
        const indexes = [0, 3, 5];

        for (let i = 0; i < indexes.length; i++) {
          const vector = new ol.layer.Vector({
            name: 'insertedLayer' + i,
          });
          group.getLayers().insertAt(indexes[i], vector);
          const groupSize = groupNode.childNodes.length;
          const idx = groupSize - indexes[i] - 1;
          const layerNode = groupNode.getChildAt(idx);
          expect(layerNode.get('text')).to.be(vector.get('name'));
        }
      });

      it('does properly order appended node', function () {
        const vector = new ol.layer.Vector({name: 'appendedLayer'});

        group.getLayers().push(vector);

        const layerNode = groupNode.getChildAt(0);
        expect(layerNode.get('text')).to.be(vector.get('name'));
      });
    });
  });

  describe('Filterable store', function () {
    let noVectorTreeStore;
    let noVectorTreePanel;

    beforeEach(function () {
      noVectorTreeStore = Ext.create('GeoExt.data.store.LayersTree', {
        layerGroup: olMap.getLayerGroup(),
        filters: [
          function (rec) {
            return !(rec.data instanceof ol.layer.Vector);
          },
        ],
      });

      noVectorTreePanel = Ext.create('Ext.tree.Panel', {
        store: noVectorTreeStore,
        renderTo: treeDiv,
        rootVisible: false,
      });
    });

    afterEach(function () {
      noVectorTreeStore.destroy();
      noVectorTreePanel.destroy();
    });

    it('works when the root is collapsed', function () {
      expect(noVectorTreeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(1);

      // add layer that should be filtered out
      olMap.addLayer(new ol.layer.Vector());

      expect(noVectorTreeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(2);
    });

    it('works when the root is expanded', function () {
      expect(noVectorTreeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(1);

      noVectorTreeStore.getRoot().expand();

      // add layer that should be filtered out
      olMap.addLayer(new ol.layer.Vector());

      expect(noVectorTreeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(2);
    });

    it('works when the filter is removed', function () {
      expect(noVectorTreeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(1);

      // add layer that should be filtered out
      olMap.addLayer(new ol.layer.Vector());

      expect(noVectorTreeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(2);

      // remove all filters
      const filters = noVectorTreeStore.getFilters();
      filters.each(function (filter) {
        noVectorTreeStore.removeFilter(filter);
      });

      expect(noVectorTreeStore.getCount()).to.be(2);
      expect(olMap.getLayers().getLength()).to.be(2);
    });

    it('works when the filter is added later', function () {
      // treeStore does not have a filter yet
      expect(treeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(1);

      // add layer that should be added to both
      olMap.addLayer(new ol.layer.Vector());

      expect(treeStore.getCount()).to.be(2);
      expect(olMap.getLayers().getLength()).to.be(2);

      // now add the filter to the stzre
      treeStore.addFilter([
        function (rec) {
          return !(rec.data instanceof ol.layer.Vector);
        },
      ]);

      expect(treeStore.getCount()).to.be(1);
      expect(olMap.getLayers().getLength()).to.be(2);
    });
  });

  describe('folderToggleMode', function () {
    let layerGroup;

    beforeEach(function () {
      layerGroup = new ol.layer.Group({
        visible: false,
        name: 'LAYERGRUBBE',
        layers: [
          new ol.layer.Tile({
            visible: false,
            name: 'LAYERGEOGRAPHYCLASS',
            source: new ol.source.TileJSON({
              url:
                'http://api.tiles.mapbox.com/v3/' +
                'mapbox.geography-class.json',
              crossOrigin: 'anonymous',
            }),
          }),
          new ol.layer.Tile({
            visible: false,
            name: 'LAYERLIGHT',
            source: new ol.source.TileJSON({
              url:
                'http://api.tiles.mapbox.com/v3/' +
                'mapbox.world-borders-light.json',
              crossOrigin: 'anonymous',
            }),
          }),
        ],
      });

      mapComponent.addLayer(layerGroup);
    });

    describe('basics', function () {
      it('sets the "classic" folderToggleMode as default', function () {
        expect(treeStore.getFolderToggleMode()).to.be('classic');
      });

      it("can't set values else then 'ol3' or 'classic'", function () {
        expect(function () {
          treeStore.setFolderToggleMode('ol3');
        }).to.not.throwException();

        expect(function () {
          treeStore.setFolderToggleMode('classic');
        }).to.not.throwException();

        expect(function () {
          treeStore.setFolderToggleMode('peter');
        }).to.throwException();

        expect(treeStore.getFolderToggleMode()).to.be('classic');
      });

      it('sets the toggleMode on all nodes', function () {
        treeStore.each(function (child) {
          expect(child.get('__toggleMode')).to.be('classic');
        });
      });
    });

    describe('classic', function () {
      it('checks all children if a folder is checked', function () {
        const layerGroupNode = treePanel.getRootNode().getChildAt(0);
        layerGroupNode.set('checked', true);

        layerGroupNode.eachChild(function (child) {
          expect(child.get('checked')).to.be(true);
        });
      });

      it('unchecks all children if a folder is unchecked', function () {
        const layerGroupNode = treePanel.getRootNode().getChildAt(0);
        layerGroupNode.set('checked', false);

        layerGroupNode.eachChild(function (child) {
          expect(child.get('checked')).to.be(false);
        });
      });

      it('checks all parent nodes if a leaf is checked', function () {
        const layerGroupNode = treePanel.getRootNode().getChildAt(0);
        const childNode = layerGroupNode.getChildAt(0);

        childNode.set('checked', true);
        expect(layerGroupNode.get('checked')).to.be(true);
      });

      it(
        'unchecks all parent nodes if a leaf and all his siblings' +
          'are unchecked',
        function () {
          const layerGroupNode = treePanel.getRootNode().getChildAt(0);

          layerGroupNode.eachChild(function (child) {
            child.set('checked', true);
          });
          expect(layerGroupNode.get('checked')).to.be(true);

          layerGroupNode.eachChild(function (child) {
            child.set('checked', false);
          });
          expect(layerGroupNode.get('checked')).to.be(false);
        },
      );
    });

    describe('ol3', function () {
      beforeEach(function () {
        treeStore.setFolderToggleMode('ol3');
      });

      it('sets the toggleMode on all nodes', function () {
        treeStore.each(function (child) {
          expect(child.get('__toggleMode')).to.be('ol3');
        });
      });

      it('folderNode does not react to leafchanges', function () {
        const layerGroupNode = treePanel.getRootNode().getChildAt(0);
        const childNode = layerGroupNode.getChildAt(0);

        layerGroupNode.set('checked', false);
        childNode.set('checked', true);
        expect(layerGroupNode.get('checked')).to.be(false);
      });

      it("leafNodes don't not react to folderchanges", function () {
        const layerGroupNode = treePanel.getRootNode().getChildAt(0);
        const childNode = layerGroupNode.getChildAt(0);

        childNode.set('checked', false);
        layerGroupNode.set('checked', true);
        expect(childNode.get('checked')).to.be(false);
      });
    });
  });

  describe('Drag behaviour', function () {
    let dragTreeDiv;
    let layer1;
    let layer2;
    let layer3;
    let innerGroup;
    let topMostGroup;
    let store;
    let tree;
    let rootNode;
    let innerGroupNode;

    beforeEach(function () {
      dragTreeDiv = document.createElement('div');
      dragTreeDiv.style.height = '500px';
      document.body.appendChild(dragTreeDiv);

      layer1 = new ol.layer.Vector({name: 'one'});
      layer2 = new ol.layer.Vector({name: 'two'});
      layer3 = new ol.layer.Vector({name: 'three'});
      innerGroup = new ol.layer.Group({
        layers: [layer2, layer3],
        name: 'innergroup',
      });
      topMostGroup = new ol.layer.Group({
        layers: [layer1, innerGroup],
        name: 'topMostGroup',
      });
      store = Ext.create('GeoExt.data.store.LayersTree', {
        layerGroup: topMostGroup,
        inverseLayerOrder: false,
      });
      tree = Ext.create('Ext.tree.Panel', {
        store: store,
        renderTo: dragTreeDiv,
        viewConfig: {
          plugins: {ptype: 'treeviewdragdrop'},
        },
        height: 300,
      });
      rootNode = store.getRootNode();
      innerGroupNode = rootNode.getChildAt(1);
    });
    afterEach(function () {
      store.destroy();
      tree.destroy();
      document.body.removeChild(dragTreeDiv);
      dragTreeDiv = null;
    });

    it('changes the layer order', function (done) {
      tree.expandAll(function () {
        // Before we do anything
        //   0 => layer2
        //   1 => layer3
        expect(innerGroup.getLayers().item(0)).to.be(layer2);
        expect(innerGroup.getLayers().item(1)).to.be(layer3);

        // Let's emulate drag
        const threeNode = innerGroupNode.getChildAt(1);
        innerGroupNode.insertChild(0, threeNode);

        // Now
        //   0 => layer3
        //   1 => layer2
        expect(innerGroup.getLayers().item(0)).to.be(layer3);
        expect(innerGroup.getLayers().item(1)).to.be(layer2);

        // Let's emulate a drag that reverts the previous one
        const twoNode = innerGroupNode.getChildAt(1);
        innerGroupNode.insertChild(0, twoNode);

        // Now the order is again just like we started
        //   0 => layer2
        //   1 => layer3
        expect(innerGroup.getLayers().item(0)).to.be(layer2);
        expect(innerGroup.getLayers().item(1)).to.be(layer3);

        done();
      });
    });

    it('can move layers to different folders', function (done) {
      tree.expandAll(function () {
        // Before we do anything
        //   0 => layer2
        //   1 => layer3
        expect(innerGroup.getLayers().item(0)).to.be(layer2);
        expect(innerGroup.getLayers().item(1)).to.be(layer3);

        // Let's emulate drag
        let oneNode = rootNode.getChildAt(0);
        innerGroupNode.appendChild(oneNode);

        // Now
        //   length = 3
        expect(innerGroup.getLayers().getLength()).to.be(3);

        // Let's emulate a drag that reverts the previous one
        oneNode = innerGroupNode.getChildAt(2);
        rootNode.appendChild(oneNode);

        // Now the length is again just like we started
        //   length = 2
        expect(innerGroup.getLayers().getLength()).to.be(2);

        done();
      });
    });

    it('can move folders around', function (done) {
      tree.expandAll(function () {
        // Before we do anything
        //   0 => layer1
        //   1 => innerGroup
        expect(topMostGroup.getLayers().item(0)).to.be(layer1);
        expect(topMostGroup.getLayers().item(1)).to.be(innerGroup);

        // Let's emulate drag
        rootNode.insertChild(0, innerGroupNode);

        // Now
        //   0 => innerGroup
        //   1 => layer1
        expect(topMostGroup.getLayers().item(0)).to.be(innerGroup);
        expect(topMostGroup.getLayers().item(1)).to.be(layer1);

        // Let's emulate a drag that reverts the previous one
        const oneNode = rootNode.getChildAt(1);
        rootNode.insertChild(0, oneNode);

        // Now the order is again just like we started
        //   0 => layer1
        //   1 => innerGroup
        expect(topMostGroup.getLayers().item(0)).to.be(layer1);
        expect(topMostGroup.getLayers().item(1)).to.be(innerGroup);

        done();
      });
    });
  });

  describe('Collapse behaviour', function () {
    let dragTreeDiv;
    let layer1;
    let layer2;
    let layer3;
    let layer4;
    let layer5;
    let innerGroup1;
    let innerGroup2;
    let topMostGroup;
    let rootNode;
    let store;
    let tree;

    beforeEach(function () {
      dragTreeDiv = document.createElement('div');
      dragTreeDiv.style.height = '500px';
      document.body.appendChild(dragTreeDiv);

      layer1 = new ol.layer.Vector({name: 'one'});
      layer2 = new ol.layer.Vector({name: 'two'});
      layer3 = new ol.layer.Vector({name: 'three'});
      layer4 = new ol.layer.Vector({name: 'four'});
      layer5 = new ol.layer.Vector({name: 'five'});
      innerGroup1 = new ol.layer.Group({
        layers: [layer4, layer5],
        name: 'innergroup1',
      });
      innerGroup2 = new ol.layer.Group({
        layers: [layer2, layer3, innerGroup1],
        name: 'innergroup2',
      });
      topMostGroup = new ol.layer.Group({
        layers: [layer1, innerGroup2],
        name: 'topMostGroup',
      });
      olMap = new ol.Map({
        target: div,
        layers: topMostGroup,
        view: new ol.View({
          center: [0, 0],
          zoom: 2,
        }),
      });
      store = Ext.create('GeoExt.data.store.LayersTree', {
        layerGroup: topMostGroup,
        inverseLayerOrder: false,
      });
      tree = Ext.create('Ext.tree.Panel', {
        store: store,
        renderTo: dragTreeDiv,
        viewConfig: {
          plugins: {ptype: 'treeviewdragdrop'},
        },
        height: 300,
      });
      rootNode = store.getRootNode();
    });
    afterEach(function () {
      store.destroy();
      tree.destroy();
      document.body.removeChild(dragTreeDiv);
      dragTreeDiv = null;
    });

    it('does not remove sublayers if folder is collapsed', function (done) {
      tree.expandAll(function () {
        // before collapse
        let numInInnerGroup = innerGroup2.getLayers().getLength();
        expect(numInInnerGroup).to.be(3);

        // collapse innergroup node
        const innerGroupNode = rootNode.getChildAt(1);
        innerGroupNode.collapse(true, function () {
          numInInnerGroup = innerGroup2.getLayers().getLength();

          // count must still be the same
          expect(numInInnerGroup).to.be(3);
          done();
        });
      });
    });

    it(
      'does not remove any folders or layers if topfolder is ' + 'collapsed',
      function (done) {
        tree.expandAll(function () {
          function getAllLayers(map) {
            const layers = map.getLayers();
            const allLayers = [];
            layers.forEach(function (l) {
              if (l instanceof ol.layer.Group) {
                Ext.each(getAllLayers(l), function (layeri) {
                  allLayers.push(layeri);
                });
              }
              allLayers.push(l);
            });
            return allLayers;
          }
          // before collapse
          const expandedNumtopMostGroup = store.getTotalCount();
          // expecting all groups + layers + ExtJs rootNode = 8 items
          expect(expandedNumtopMostGroup).to.be(8);
          const expandedAllLayersAndGroupsCount = getAllLayers(olMap).length;
          // expecting all groups + layers = 7 items
          expect(expandedAllLayersAndGroupsCount).to.be(7);

          // collapse topgroup node
          rootNode.collapseChildren(true, function () {
            const collapsedNumtopMostGroup = store.getTotalCount();
            // expecting ExtJs rootNode + two folder of topMostGroup
            // this is due to the strange behaviour that ExtJs removes
            // all children from first visible node on collapsing
            expect(collapsedNumtopMostGroup).to.be(3);
            const collapsedAllLayersAndGroupsCount = getAllLayers(olMap).length;
            // still expecting all groups + layers = 8 items
            expect(collapsedAllLayersAndGroupsCount).to.be(7);
            done();
          });
        });
      },
    );
  });
});

describe('A GeoExt.data.store.LayersTree', function () {
  it('can be extended with custom LayerTreeNodes', function () {
    const layer = new ol.layer.Group({name: 'any'});
    let store;
    let record;

    // custom LayerTreeNode
    Ext.define('GeoExt.CustomTreeNode', {
      extend: 'GeoExt.data.model.LayerTreeNode',
      fields: [
        {
          name: 'text',
          type: 'string',
          convert: function () {
            return 'test';
          },
        },
      ],
    });
    expect(GeoExt.CustomTreeNode).to.not.be(undefined);

    // custom LayersTree
    Ext.define('GeoExt.CustomLayersTree', {
      extend: 'GeoExt.data.store.LayersTree',
      model: 'GeoExt.CustomTreeNode',
    });
    expect(GeoExt.CustomLayersTree).to.not.be(undefined);

    store = Ext.create('GeoExt.CustomLayersTree', {
      layerGroup: new ol.layer.Group({
        layers: [layer],
      }),
    });
    record = store.getRootNode().getChildAt(0);

    expect(store.getTotalCount()).to.be(1);
    expect(record).to.be.a(GeoExt.CustomTreeNode);
    expect(record.get('text')).to.be('test');
  });
});
