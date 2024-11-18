Ext.require([
  'GeoExt.component.Map',
  'GeoExt.data.MapfishPrintProvider',
  'GeoExt.data.serializer.TileWMS',
  'GeoExt.data.serializer.Vector',
]);

let olMap;
let mapComponent;
let mapPanel;

Ext.application({
  name: 'MapPanel',
  launch: function () {
    let description;

    const extentLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
    });

    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: '../data/SanFranciscoPublicSchools-Points.kml',
        format: new ol.format.KML(),
        attributions: [
          '<a href="https://data.sfgov.org/Geographic' +
            '-Locations-and-Boundaries/San-Francisco-Public' +
            '-Schools-Points/dpub-rukj">' +
            '© 2015 City and County of San Francisco' +
            '</a>' +
            ', (via data.sfgov.org)',
        ],
      }),
    });

    const bgLayer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: 'https://ows.terrestris.de/osm-gray/service',
        params: {
          LAYERS: 'OSM-WMS',
        },
      }),
    });

    olMap = new ol.Map({
      layers: [bgLayer, vectorLayer, extentLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat([-122.416667, 37.783333]),
        zoom: 12,
      }),
    });

    mapComponent = Ext.create('GeoExt.component.Map', {
      map: olMap,
    });

    mapPanel = Ext.create('Ext.panel.Panel', {
      title: 'GeoExt.data.model.print.Capability Example',
      region: 'center',
      layout: 'fit',
      items: [mapComponent],
    });

    description = Ext.create('Ext.panel.Panel', {
      contentEl: 'description',
      title: 'Description',
      region: 'east',
      width: 300,
      border: false,
      bodyPadding: 5,
    });

    /**
     * A small utility method that will change the `baseURL` from https to
     * http (if needed and possible), because the MapFish instance we are
     * talking to currently cannot handle all 'https' requests.
     *
     * Please note that this is a restriction posed by the remote server, a
     * correctly configured MapFish instance can very well handle https.
     *
     * @param {Array<Object>} layers An array of serialized layers.
     * @return {Array<Object>} An array of serialized layers, https URLs
     *     will now point to their http-equivalent.
     */
    const unHttpsLayers = function (layers) {
      const changed = [];
      Ext.each(layers, function (layer) {
        const clone = Ext.clone(layer);
        if (clone.baseURL && /^https:/i.test(clone.baseURL)) {
          clone.baseURL = clone.baseURL.replace('https', 'http');
        }
        changed.push(clone);
      });
      return changed;
    };

    /**
     * Once the store is loaded, we can create the button with the
     * following assumptions:
     *
     *     * The button will print the first layout
     *     * The attributes used are the first of the above layout
     *     * We'll request the first dpi value of the suggested ones
     * @param {GeoExt.data.MapfishPrintProvider} provider The print
     *     provider.
     */
    const onPrintProviderReady = function (provider) {
      // this is the assumption: take the first layout and render an
      // appropriate extent on the map
      const capabilities = provider.capabilityRec;
      const layout = capabilities.layouts().getAt(0);
      const attr = layout.attributes().getAt(0);
      const clientInfo = attr.get('clientInfo');
      const render = GeoExt.data.MapfishPrintProvider.renderPrintExtent;
      render(mapComponent, extentLayer, clientInfo);
      mapComponent.getView().on('propertychange', function () {
        extentLayer.getSource().clear();
        render(mapComponent, extentLayer, clientInfo);
      });
      description.add({
        xtype: 'button',
        text: 'Print',
        handler: function () {
          const spec = {
            layout: layout.get('name'),
            attributes: {},
          };
          const firstFeature = extentLayer.getSource().getFeatures()[0];
          const bbox = firstFeature.getGeometry().getExtent();
          const util = GeoExt.data.MapfishPrintProvider;
          const mapView = mapComponent.getView();
          let serializedLayers = util.getSerializedLayers(
            mapComponent,
            function (layer) {
              // do not print the extent layer
              const isExtentLayer = extentLayer === layer;
              return !isExtentLayer;
            },
          );
          serializedLayers = unHttpsLayers(serializedLayers);
          serializedLayers.reverse();
          spec.attributes[attr.get('name')] = {
            bbox: bbox,
            dpi: clientInfo.dpiSuggestions[0],
            layers: serializedLayers,
            projection: mapView.getProjection().getCode(),
            rotation: mapView.getRotation(),
          };
          Ext.create('Ext.form.Panel', {
            standardSubmit: true,
            url:
              'https://apps.terrestris.de/print-servlet-3.29/' +
              'print/geoext/buildreport.pdf',
            method: 'POST',
            items: [
              {
                xtype: 'textfield',
                name: 'spec',
                value: Ext.encode(spec),
              },
            ],
          }).submit();
        },
      });
    };

    Ext.create('GeoExt.data.MapfishPrintProvider', {
      url:
        'https://apps.terrestris.de/print-servlet-3.29/' +
        'print/geoext/capabilities.json',
      listeners: {
        ready: onPrintProviderReady,
      },
      useJsonp: false,
    });

    Ext.create('Ext.Viewport', {
      layout: 'border',
      items: [mapPanel, description],
    });
  },
});
