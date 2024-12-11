/* Copyright (c) 2015-present The Open Source Geospatial Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * An GeoExt.component.OverviewMap displays an overview map of a parent map.
 * You can use this component as any other Ext.Component, e.g give it as an item
 * to a panel.
 *
 * Example:
 *
 *     @example preview
 *     var olMap = new ol.Map({
 *         layers: [
 *             new ol.layer.Tile({
 *                source: new ol.source.OSM()
 *             })
 *         ],
 *         view: new ol.View({
 *             center: ol.proj.fromLonLat([-8.751278, 40.611368]),
 *             zoom: 12,
 *             rotation: -Math.PI / 6
 *         })
 *     });
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: olMap
 *     });
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *        title: 'Map',
 *        region: 'center',
 *        layout: 'fit',
 *        items: mapComponent
 *     });
 *     var overviewMapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'OverviewMap',
 *         region: 'west',
 *         layout: 'fit',
 *         width: 160,
 *         // create the overview by passing the ol.Map:
 *         items: Ext.create('GeoExt.component.OverviewMap', {
 *             parentMap: olMap
 *         })
 *     });
 *     Ext.create('Ext.panel.Panel', {
 *        height: 300,
 *        layout: 'border',
 *        items: [mapPanel, overviewMapPanel],
 *        renderTo: Ext.getBody()
 *     });
 *
 * @class GeoExt.component.OverviewMap
 */
Ext.define('GeoExt.component.OverviewMap', {
  extend: 'Ext.Component',
  alias: [
    'widget.gx_overview',
    'widget.gx_overviewmap',
    'widget.gx_component_overviewmap',
  ],
  requires: ['GeoExt.util.Version', 'GeoExt.util.Layer'],
  mixins: ['GeoExt.mixin.SymbolCheck'],

  // <debug>
  symbols: [
    // For ol4 support we can no longer require this symbols:
    // 'ol.animation.pan',
    // 'ol.Map#beforeRender',
    'ol.Collection',
    'ol.Feature',
    'ol.Feature#setGeometry',
    'ol.Feature#setStyle',
    'ol.geom.Point',
    'ol.geom.Point#getCoordinates',
    'ol.geom.Point#setCoordinates',
    'ol.geom.Polygon',
    'ol.geom.Polygon#getCoordinates',
    'ol.geom.Polygon#setCoordinates',
    'ol.interaction.Translate',
    'ol.layer.Image', // we should get rid of this requirement
    'ol.layer.Tile', // we should get rid of this requirement
    'ol.layer.Vector',
    'ol.layer.Vector#getSource',
    'ol.Map',
    'ol.Map#addLayer',
    'ol.Map#getView',
    'ol.Map#on',
    'ol.Map#updateSize',
    'ol.Map#un',
    'ol.source.Vector',
    'ol.source.Vector#addFeatures',
    'ol.View',
    'ol.View#calculateExtent',
    'ol.View#getCenter',
    'ol.View#getProjection',
    'ol.View#getRotation',
    'ol.View#getZoom',
    'ol.View#on',
    'ol.View#set',
    'ol.View#setCenter',
    'ol.View#un',
  ],
  // </debug>

  inheritableStatics: {
    /**
     * Returns an object with geometries representing the extent of the
     * passed map and the top left point.
     *
     * @param {ol.Map} map The map to the extent and top left corner
     *     geometries from.
     * @return {Object} An object with keys `extent` and `topLeft`.
     */
    getVisibleExtentGeometries: function (map) {
      const mapSize = map && map.getSize();
      const w = mapSize && mapSize[0];
      const h = mapSize && mapSize[1];
      if (!mapSize || isNaN(w) || isNaN(h)) {
        return;
      }
      const pixels = [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
        [0, 0],
      ];
      const extentCoords = [];
      Ext.each(pixels, function (pixel) {
        const coord = map.getCoordinateFromPixel(pixel);
        if (coord === null) {
          return false;
        }
        extentCoords.push(coord);
      });
      if (extentCoords.length !== 5) {
        return;
      }
      const geom = new ol.geom.Polygon([extentCoords]);
      const anchor = new ol.geom.Point(extentCoords[0]);
      return {
        extent: geom,
        topLeft: anchor,
      };
    },
  },

  config: {
    /**
     * The style for the anchor feature which indicates the upper-left
     * corner of the overview rectangle.
     *
     * @cfg {ol.style.Style} anchorStyle
     */
    anchorStyle: null,

    /**
     * The style for the overview rectangle.
     *
     * @cfg {ol.style.Style} boxStyle
     */
    boxStyle: null,

    /**
     * An `Array` of `ol.layer.Base`. It needs to have own layers
     * specified, it cannot use layers of the parent map.
     *
     * @cfg {Array}
     */
    layers: [],

    /**
     * The magnification is the relationship in which the resolution of the
     * overviewmaps view is bigger then resolution of the parentMaps view.
     *
     * @cfg {number} magnification
     */
    magnification: 5,

    /**
     * A configured map or a configuration object for the map constructor.
     *
     * **This is the overviewMap itself.**
     *
     * @cfg {ol.Map/Object} map
     */
    map: null,

    /**
     * A configured map or a configuration object for the map constructor.
     *
     * **This should be the map the overviewMap is bound to.**
     *
     * @cfg {ol.Map} parentMap
     */
    parentMap: null,

    /**
     * Shall a click on the overview map recenter the parent map?
     *
     * @cfg {boolean} recenterOnClick Whether we shall recenter the parent
     *     map on a click on the overview map or not.
     */
    recenterOnClick: true,

    /**
     * Shall the extent box on the overview map be draggable to recenter the
     * parent map?
     *
     * @cfg {boolean} enableBoxDrag Whether we shall make the box feature of
     *     the overview map draggable. When dragging ends, the parent map
     *     is recentered.
     */
    enableBoxDrag: true,

    /**
     * Duration time in milliseconds of the panning animation when we
     * recenter the map after a click on the overview or after dragging of
     * the extent box ends. Only has effect if either or both of the
     * configs #recenterOnClick or #enableBoxDrag are `true`.
     *
     * @cfg {number} recenterDuration Amount of milliseconds for panning
     *     the parent map to the clicked location or the new center of the
     *     box feature.
     */
    recenterDuration: 500,
  },
  /**
   * The `ol.Feature` that represents the extent of the parent map.
   *
   * @type {ol.Feature}
   * @private
   */
  boxFeature: null,

  /**
   * The `ol.Feature` that represents the top left corner 0f the parent map.
   *
   * @type {ol.Feature}
   * @private
   */
  anchorFeature: null,

  /**
   * The `ol.layer.Vector` displaying the extent geometry of the parent map.
   *
   * @private
   */
  extentLayer: null,

  /**
   * The `ol.interaction.Translate` that we might have created (depending on
   * the setting of the #enableBoxDrag configuration).
   *
   * @private
   */
  dragInteraction: null,

  /**
   * Whether we already rendered an ol.Map in this component. Will be
   * updated in #onResize, after the first rendering happened.
   *
   * @property {boolean} mapRendered
   * @private
   */
  mapRendered: false,

  /**
   * The constructor of the OverviewMap component.
   */
  constructor: function () {
    this.initOverviewFeatures();
    this.callParent(arguments);
  },

  /**
   * Initializes the GeoExt.component.OverviewMap.
   */
  initComponent: function () {
    const me = this;

    if (!me.getParentMap()) {
      Ext.Error.raise('No parentMap defined for overviewMap');
    } else if (!(me.getParentMap() instanceof ol.Map)) {
      Ext.Error.raise('parentMap is not an instance of ol.Map');
    }

    me.initOverviewMap();

    me.on('beforedestroy', me.onBeforeDestroy, me);
    me.on('resize', me.onResize, me);
    me.on('afterrender', me.updateBox, me);

    me.callParent();
  },

  /**
   * Creates the ol instances we need: two features for the box and the
   * anchor, and a vector layer with empty source to hold the features.
   *
   * @private
   */
  initOverviewFeatures: function () {
    const me = this;
    me.boxFeature = new ol.Feature();
    me.anchorFeature = new ol.Feature();
    me.extentLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
    });
  },

  /**
   * Initializes the #map from the configuration and the #parentMap.
   *
   * @private
   */
  initOverviewMap: function () {
    const me = this;
    const parentMap = me.getParentMap();
    const ovMap = me.getMap();

    me.getLayers().push(me.extentLayer);

    if (!ovMap) {
      const parentView = parentMap.getView();
      const olMap = new ol.Map({
        controls: new ol.Collection(),
        interactions: new ol.Collection(),
        view: new ol.View({
          center: parentView.getCenter(),
          zoom: parentView.getZoom(),
          projection: parentView.getProjection(),
        }),
      });
      me.setMap(olMap);
    } else if (ovMap.getView() && !ovMap.getView().getCenter()) {
      // OL expects (any) center here.
      // otherwise problems as described in
      // https://github.com/geoext/geoext/issues/707 can occur
      ovMap.getView().setCenter([0, 0]);
    }

    GeoExt.util.Layer.cascadeLayers(
      parentMap.getLayerGroup(),
      function (layer) {
        if (me.getLayers().indexOf(layer) > -1) {
          throw new Error(
            'OverviewMap cannot use layers of the ' +
              'parent map. (Since ol v6.0.0 maps cannot share ' +
              'layers anymore)',
          );
        }
      },
    );

    Ext.each(me.getLayers(), function (layer) {
      me.getMap().addLayer(layer);
    });

    // Set the OverviewMaps center or resolution, on property changed
    // in parentMap.
    parentMap
      .getView()
      .on('propertychange', me.onParentViewPropChange.bind(me));

    // Update the box after rendering a new frame of the parentMap.
    me.enableBoxUpdate();

    // Initially set the center and resolution of the overviewMap.
    me.setOverviewMapProperty('center');
    me.setOverviewMapProperty('resolution');

    me.extentLayer.getSource().addFeatures([me.boxFeature, me.anchorFeature]);
  },

  /**
   * Enable everything we need to be able to drag the extent box on the
   * overview map, and to properly handle drag events (e.g. recenter on
   * finished dragging).
   */
  setupDragBehaviour: function () {
    const me = this;
    const dragInteraction = new ol.interaction.Translate({
      features: new ol.Collection([me.boxFeature]),
    });
    me.getMap().addInteraction(dragInteraction);
    dragInteraction.setActive(true);
    // disable the box update during the translation
    // because it interferes when dragging the feature
    dragInteraction.on('translatestart', me.disableBoxUpdate.bind(me));
    dragInteraction.on('translating', me.repositionAnchorFeature.bind(me));
    dragInteraction.on('translateend', me.recenterParentFromBox.bind(me));
    dragInteraction.on('translateend', me.enableBoxUpdate.bind(me));
    me.dragInteraction = dragInteraction;
  },

  /**
   * Disables the update of the box by unbinding the updateBox function
   * from the postrender event of the parent map.
   */
  disableBoxUpdate: function () {
    const me = this;
    const parentMap = me.getParentMap();
    if (parentMap) {
      parentMap.un('postrender', me.updateBox, me);
    }
  },

  /**
   * Enables the update of the box by binding the updateBox function
   * to the postrender event of the parent map.
   */
  enableBoxUpdate: function () {
    const me = this;
    const parentMap = me.getParentMap();
    if (parentMap) {
      parentMap.on('postrender', me.updateBox.bind(me));
    }
  },

  /**
   * Disable / destroy everything we need to be able to drag the extent box on
   * the overview map. Unregisters any events we might have added and removes
   * the `ol.interaction.Translate`.
   */
  destroyDragBehaviour: function () {
    const me = this;
    const dragInteraction = me.dragInteraction;
    if (!dragInteraction) {
      return;
    }
    dragInteraction.setActive(false);
    me.getMap().removeInteraction(dragInteraction);
    dragInteraction.un('translatestart', me.disableBoxUpdate, me);
    dragInteraction.un('translating', me.repositionAnchorFeature, me);
    dragInteraction.un('translateend', me.recenterParentFromBox, me);
    dragInteraction.un('translateend', me.enableBoxUpdate, me);
    me.dragInteraction = null;
  },

  /**
   * Repositions the #anchorFeature during dragging sequences of the box.
   * Called while the #boxFeature is being dragged.
   */
  repositionAnchorFeature: function () {
    const me = this;
    const boxCoords = me.boxFeature.getGeometry().getCoordinates();
    const topLeftCoord = boxCoords[0][0];
    const newAnchorGeom = new ol.geom.Point(topLeftCoord);
    me.anchorFeature.setGeometry(newAnchorGeom);
  },

  /**
   * Recenters the #parentMap to the center of the extent of the #boxFeature.
   * Called when dragging of the #boxFeature ends.
   */
  recenterParentFromBox: function () {
    const me = this;

    const parentMap = me.getParentMap();
    const parentView = parentMap.getView();
    const parentProjection = parentView.getProjection();

    const overviewMap = me.getMap();
    const overviewView = overviewMap.getView();
    const overviewProjection = overviewView.getProjection();

    const currentMapCenter = parentView.getCenter();
    const boxExtent = me.boxFeature.getGeometry().getExtent();
    let boxCenter = ol.extent.getCenter(boxExtent);

    // transform if necessary
    if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
      boxCenter = ol.proj.transform(
        boxCenter,
        overviewProjection,
        parentProjection,
      );
    }

    // Check for backwards compatibility
    if (GeoExt.util.Version.isOl3()) {
      const panAnimation = ol.animation.pan({
        duration: me.getRecenterDuration(),
        source: currentMapCenter,
      });
      parentMap.beforeRender(panAnimation);
      parentView.setCenter(boxCenter);
    } else {
      parentView.animate({
        center: boxCenter,
      });
    }
  },

  /**
   * Called when a property of the parent maps view changes.
   *
   * @param {ol.ObjectEvent} evt The event emitted by the `ol.Object`.
   * @private
   */
  onParentViewPropChange: function (evt) {
    if (evt.key === 'center' || evt.key === 'resolution') {
      this.setOverviewMapProperty(evt.key);
    }
  },

  /**
   * Handler for the click event of the overview map. Recenters the parent
   * map to the clicked location.
   *
   * @param {ol.MapBrowserEvent} evt The click event on the map.
   * @private
   */
  overviewMapClicked: function (evt) {
    const me = this;
    const parentMap = me.getParentMap();
    const parentView = parentMap.getView();
    const parentProjection = parentView.getProjection();
    const currentMapCenter = parentView.getCenter();
    const overviewMap = me.getMap();
    const overviewView = overviewMap.getView();
    const overviewProjection = overviewView.getProjection();
    let newCenter = evt.coordinate;

    // transform if necessary
    if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
      newCenter = ol.proj.transform(
        newCenter,
        overviewProjection,
        parentProjection,
      );
    }

    // Check for backwards compatibility
    if (GeoExt.util.Version.isOl3()) {
      const panAnimation = ol.animation.pan({
        duration: me.getRecenterDuration(),
        source: currentMapCenter,
      });
      parentMap.beforeRender(panAnimation);
      parentView.setCenter(newCenter);
    } else {
      parentView.animate({
        center: newCenter,
      });
    }
  },

  /**
   * Updates the Geometry of the extentLayer.
   */
  updateBox: function () {
    const me = this;
    const parentMap = me.getParentMap();
    const extentGeometries = me.self.getVisibleExtentGeometries(parentMap);
    if (!extentGeometries) {
      return;
    }
    const geom = extentGeometries.extent;
    const anchor = extentGeometries.topLeft;

    const parentMapProjection = parentMap.getView().getProjection();
    const overviewProjection = me.getMap().getView().getProjection();

    // transform if necessary
    if (!ol.proj.equivalent(parentMapProjection, overviewProjection)) {
      geom.transform(parentMapProjection, overviewProjection);
      anchor.transform(parentMapProjection, overviewProjection);
    }

    me.boxFeature.setGeometry(geom);
    me.anchorFeature.setGeometry(anchor);
  },

  /**
   * Set an OverviewMap property (center or resolution).
   *
   * @param {string} key The name of the property, either `'center'` or
   *     `'resolution'`
   */
  setOverviewMapProperty: function (key) {
    const me = this;

    const parentView = me.getParentMap().getView();
    const parentProjection = parentView.getProjection();
    const overviewView = me.getMap().getView();
    const overviewProjection = overviewView.getProjection();

    let overviewCenter = parentView.getCenter();

    if (key === 'center') {
      // transform if necessary
      if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
        overviewCenter = ol.proj.transform(
          overviewCenter,
          parentProjection,
          overviewProjection,
        );
      }
      overviewView.set('center', overviewCenter);
    }
    if (key === 'resolution') {
      if (ol.proj.equivalent(parentProjection, overviewProjection)) {
        overviewView.set(
          'resolution',
          me.getMagnification() * parentView.getResolution(),
        );
      } else if (me.mapRendered === true) {
        const parentExtent = parentView.calculateExtent(
          me.getParentMap().getSize(),
        );
        const parentExtentProjected = ol.proj.transformExtent(
          parentExtent,
          parentProjection,
          overviewProjection,
        );

        // call fit to assure that resolutions are available on
        // overviewView

        overviewView.fit(parentExtentProjected);
        overviewView.set(
          'resolution',
          me.getMagnification() * overviewView.getResolution(),
        );
      }
      // Do nothing when parent and overview projections are not
      // equivalent and mapRendered is false as me.getMap().getSize()
      // would not be reliable here.
      // Note: As soon as mapRendered will be set to true (in onResize())
      // setOverviewMapProperty('resolution') will be called explicitly
    }
  },

  /**
   * The applier for the #recenterOnClick configuration. Takes care of
   * initially registering an appropriate eventhandler and also unregistering
   * if the property changes.
   *
   * @param {boolean} shallRecenter The value for #recenterOnClick that was
   *     set.
   * @return {boolean} The value for #recenterOnClick that was passed.
   */
  applyRecenterOnClick: function (shallRecenter) {
    const me = this;
    const map = me.getMap();

    if (!map) {
      me.addListener(
        'afterrender',
        function () {
          // set the property again, and re-trigger the 'apply…'-sequence
          me.setRecenterOnClick(shallRecenter);
        },
        me,
        {single: true},
      );
      return shallRecenter;
    }
    if (shallRecenter) {
      map.on('click', me.overviewMapClicked.bind(me));
    } else {
      map.un('click', me.overviewMapClicked.bind(me));
    }
    return shallRecenter;
  },

  /**
   * The applier for the #enableBoxDrag configuration. Takes care of initially
   * setting up an interaction if desired or destroying when dragging is not
   * wanted.
   *
   * @param {boolean} shallEnableBoxDrag The value for #enableBoxDrag that was
   *     set.
   * @return {boolean} The value for #enableBoxDrag that was passed.
   */
  applyEnableBoxDrag: function (shallEnableBoxDrag) {
    const me = this;
    const map = me.getMap();

    if (!map) {
      me.addListener(
        'afterrender',
        function () {
          // set the property again, and re-trigger the 'apply…'-sequence
          me.setEnableBoxDrag(shallEnableBoxDrag);
        },
        me,
        {single: true},
      );
      return shallEnableBoxDrag;
    }
    if (shallEnableBoxDrag) {
      me.setupDragBehaviour();
    } else {
      me.destroyDragBehaviour();
    }
    return shallEnableBoxDrag;
  },

  /**
   * Cleanup any listeners we may have bound.
   */
  onBeforeDestroy: function () {
    const me = this;
    const map = me.getMap();
    const parentMap = me.getParentMap();
    const parentView = parentMap && parentMap.getView();

    if (map) {
      // unbind recenter listener, if any
      map.un('click', me.overviewMapClicked, me);
    }

    me.destroyDragBehaviour();

    if (parentMap) {
      // unbind parent listeners
      me.disableBoxUpdate();
      parentView.un('propertychange', me.onParentViewPropChange, me);
    }
  },

  /**
   * Update the size of the ol.Map onResize.
   *
   * TODO can we reuse the mapcomponent code? Perhaps even for this complete
   *     class???
   * @private
   */
  onResize: function () {
    // Get the corresponding view of the controller (the mapPanel).
    const me = this;
    const div = me.getEl().dom;
    const map = me.getMap();

    if (!me.mapRendered) {
      map.setTarget(div);
      me.mapRendered = true;

      // explicit call to assure that magnification mechanism will also
      // work initially if projections of parent and overview are
      // not equal
      me.setOverviewMapProperty('resolution');
    } else {
      me.getMap().updateSize();
    }
  },

  /**
   * The applier for the anchor style.
   *
   * @param {ol.Style} style The new style for the anchor feature that was
   *     set.
   * @return {ol.Style} The new style for the anchor feature.
   */
  applyAnchorStyle: function (style) {
    this.anchorFeature.setStyle(style);
    return style;
  },

  /**
   * The applier for the box style.
   *
   * @param {ol.Style} style The new style for the box feature that was set.
   * @return {ol.Style} The new style for the box feature.
   */
  applyBoxStyle: function (style) {
    this.boxFeature.setStyle(style);
    return style;
  },
});
