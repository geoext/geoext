Ext.require([
  'Ext.container.Container',
  'Ext.panel.Panel',
  'Ext.grid.Panel',
  'Ext.grid.filters.Filters',
  'GeoExt.component.Map',
  'GeoExt.data.store.Features',
  'GeoExt.util.OGCFilter',
]);

let olMap;
let gridWest;
let featStore;
let vectorSource;
let wfsSource;
let wmsLayer;
let wfsGetFeatureFilter;

Ext.application({
  name: 'FeatureGridWithFilter',
  launch: function () {
    // prepare the vector layer which will be used
    // in the featuregrid and on the map
    vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857',
      }),
      features: new ol.Collection(),
    });
    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
    });

    // prepare the wfs layer just to show that its also supported
    wfsSource = new ol.source.Vector({
      format: new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857',
      }),
      features: new ol.Collection(),
      // the loader will load all features via `GET` per default.
      // If a filter is set, request will change to
      // `POST` with valid OGC filter
      loader: function () {
        const url = 'https://maps.dwd.de/geoserver/dwd/ows?';
        let params =
          'service=WFS&' +
          'version=2.0.0&' +
          'request=GetFeature&' +
          'typeName=dwd:Warngebiete_Kreise&' +
          'outputFormat=application/json';
        let method = 'GET';
        if (wfsGetFeatureFilter) {
          method = 'POST';
          params += '&filter=' + wfsGetFeatureFilter;
        }
        Ext.Ajax.request({
          method: method,
          url: url,
          params: params,
          success: function (response) {
            wfsSource.addFeatures(
              wfsSource.getFormat().readFeatures(response.responseText),
            );
          },
        });
      },
    });
    const wfsLayer = new ol.layer.Vector({
      source: wfsSource,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 255, 0, 1.0)',
          width: 2,
        }),
      }),
    });

    // fetch the data for the vector layer
    this.getData(vectorLayer.getSource());

    // also add an WMS layer to show the support
    // via `filter` request parameter
    wmsLayer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: 'https://maps.dwd.de/geoserver/dwd/ows?',
        params: {
          LAYERS: 'dwd:Warngebiete_Kreise',
          TILED: true,
        },
        attributions: [
          '<a href="https://www.dwd.de">' +
            'Copyright: © Deutscher Wetterdienst</a>',
        ],
      }),
    });

    olMap = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.TileWMS({
            url: 'https://ows.terrestris.de/osm-gray/service',
            params: {LAYERS: 'OSM-WMS', TILED: true},
            attributions: [
              '<a href="https://www.openstreetmap.org/' +
                'copyright">OpenStreetMap contributors</a>',
            ],
          }),
        }),
        wmsLayer,
        wfsLayer,
        vectorLayer,
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([8, 50]),
        zoom: 5,
      }),
    });

    // create feature store by passing a layer
    featStore = Ext.create('GeoExt.data.store.Features', {
      model: 'GeoExt.data.model.Feature',
      layer: vectorLayer,
      passThroughFilter: true,
    });

    // create the feature grid
    gridWest = Ext.create('Ext.grid.Panel', {
      title: 'Feature Grid with selection',
      border: true,
      region: 'west',
      store: featStore,
      plugins: 'gridfilters',
      columns: [
        {
          text: 'List',
          dataIndex: 'WARNCELLID',
          flex: 1,
          filter: {
            type: 'list',
          },
        },
        {
          text: 'String',
          dataIndex: 'NAME',
          flex: 2,
          filter: {
            type: 'string',
          },
        },
        {
          text: 'Number',
          dataIndex: 'WARNCELLID',
          flex: 2,
          filter: {
            type: 'number',
          },
        },
        {
          text: 'Date',
          xtype: 'datecolumn',
          formatter: 'date("Y-m-d")',
          dataIndex: 'PROCESSTIME',
          flex: 2,
          filter: {
            type: 'date',
            dateFormat: 'Y-m-d',
          },
        },
      ],
      width: 500,
      listeners: {
        filterchange: function (rec, filters) {
          const wmsFilter =
            GeoExt.util.OGCFilter.getOgcWmsFilterFromExtJsFilter(filters);
          wmsLayer.getSource().updateParams({
            filter: wmsFilter,
            cacheBuster: Math.random(),
          });
          wfsGetFeatureFilter =
            GeoExt.util.OGCFilter.getOgcWfsFilterFromExtJsFilter(
              filters,
              'And',
              '2.0.0',
            );
          wfsLayer.getSource().refresh();
        },
      },
    });
    const mapComponent = Ext.create('GeoExt.component.Map', {
      map: olMap,
    });
    const mapPanel = Ext.create('Ext.panel.Panel', {
      region: 'center',
      height: 400,
      layout: 'fit',
      items: [mapComponent],
    });
    const description = Ext.create('Ext.panel.Panel', {
      contentEl: 'description',
      region: 'north',
      title: 'Description',
      height: 230,
      border: false,
      bodyPadding: 5,
      autoScroll: true,
    });
    Ext.create('Ext.Viewport', {
      layout: 'border',
      items: [description, mapPanel, gridWest],
    });
  },

  getRandomDateFromPastYear: function () {
    const now = new Date();
    const startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 5);

    const startTimestamp = startDate.getTime();
    const endTimestamp = now.getTime();

    // Generate a random timestamp
    const randomTimestamp =
      Math.floor(Math.random() * (endTimestamp - startTimestamp)) +
      startTimestamp;
    return new Date(randomTimestamp);
  },

  /**
   * Loads the data for the initial fill of vectorlayer / grid
   * @param {ol.source.Vector} source The vector source
   */
  getData: function (source) {
    const me = this;
    Ext.Ajax.request({
      method: 'POST',
      url: 'https://maps.dwd.de/geoserver/dwd/ows?',
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'dwd:Warngebiete_Kreise',
        outputFormat: 'application/json',
      },
      success: function (response) {
        const geojson = Ext.decode(response.responseText);
        const gjFormat = new ol.format.GeoJSON({
          featureProjection: 'EPSG:3857',
        });
        const features = gjFormat.readFeatures(geojson);
        // mockup some real dates
        features.forEach(function (f) {
          f.set('PROCESSTIME', me.getRandomDateFromPastYear());
        });
        source.addFeatures(features);
      },
    });
  },
});
