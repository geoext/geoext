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
 * A utility class for detecting if the OpenLayers version is 3.x.x or 4.x.x.
 *
 * @class GeoExt.util.Version
 */
Ext.define('GeoExt.util.Version', {
    statics: {
        /**
        * As OpenLayers itself doesn't has any version methods we check for
        * functionality that is only supported in ol3.
         * @return {boolean} true if ol version is 3.x.x false if 4.x.x
         */
        isOl3: function() {
            return !!(ol.animation && ol.Map.prototype.beforeRender);
        },
        /**
         * Determine if the loaded version of OpenLayers is v.4.x.x.
         * @return {boolean} true if ol version is 4.x.x false if 3.x.x
         */
        isOl4: function() {
            return !this.isOl3();
        }
    }
});

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
 * A utility class providing methods to check for symbols of OpenLayers we
 * depend upon.
 *
 * This class can be mixed into classes to check if the dependencies to external
 * symbols are fulfilled. An example:
 *
 *     Ext.define('MyNewClass.DependingOnOpenLayersClasses', {
 *         mixins: ['GeoExt.mixin.SymbolCheck'],
 *         // the contents of the `symbols` property will be checked
 *         symbols: [
 *             'ol.Map', // checking a class
 *             'ol.View.prototype.constrainResolution', // an instance method
 *             'ol.control.ScaleLine#getUnits', // other way for instance method
 *             'ol.color.asArray', // one way to reference a static method
 *             'ol.color::asString' // other way to reference a static method
 *         ]
 *         // … your configuration and methods …
 *     });
 *
 * Since this sort of checking usually only makes sense in debug mode, you can
 * additionally wrap the `symbols`-configuration in these `<debug>`-line
 * comments:
 *
 *     Ext.define('MyNewClass.DependingOnOpenLayersClasses', {
 *         mixins: ['GeoExt.mixin.SymbolCheck'],
 *         // <debug>
 *         symbols: []
 *         // </debug>
 *     });
 *
 * This means that the array of symbols is not defined in production builds
 * as the wrapped lines are simply removed from the final JavaScript.
 *
 * If one of the symbols cannot be found, a warning will be printed to the
 * developer console (via `Ext.log.warn`, which will only print in a debug
 * build):
 *
 *     [W] The class "MyNewClass.DependingOnOpenLayersClasses" depends on the
 *     external symbol "ol.color.notExisting", which does not seem to exist.
 *
 * @class GeoExt.mixin.SymbolCheck
 */
Ext.define('GeoExt.mixin.SymbolCheck', {
    extend: 'Ext.Mixin',
    inheritableStatics: {
        /**
         * An object that we will use to store already looked up references in.
         *
         * The key will be a symbol (after it has been normalized by the
         * method #normalizeSymbol), and the value will be a boolean indicating
         * if the symbol was found to be defined when it was checked.
         *
         * @private
         */
        _checked: {},
        // will be filled while we are checking stuff for existence
        /**
         * Checks whether the required symbols of the given class are defined
         * in the global context. Will log to the console if a symbol cannot be
         * found.
         *
         * @param {Ext.Base} cls An ext class defining a property `symbols` that
         *     that this method will check.
         */
        check: function(cls) {
            var me = this;
            var proto = cls.prototype;
            var olSymbols = proto && proto.symbols;
            var clsName = proto && proto['$className'];
            if (!olSymbols) {
                return;
            }
            Ext.each(olSymbols, function(olSymbol) {
                olSymbol = me.normalizeSymbol(olSymbol);
                me.checkSymbol(olSymbol, clsName);
            });
        },
        /**
         * Normalizes a short form of a symbol to a canonical one we use to
         * store the results of the #isDefinedSymbol method. The following two
         * normalizations take place:
         *
         * * A `#` in the symbol is being replaced with `.prototype.` so that
         *   e.g. the symbol `'ol.Class#methodName'` turns into the symbol
         *   `'ol.Class.prototype.methodName'`
         * * A `::` in the symbol is being replaced with `.` so that
         *   e.g. the symbol `'ol.Class::staticMethodName'` turns into the
         *   symbol `'ol.Class.staticMethodName'`
         *
         * @param {String} symbolStr A string to normalize.
         * @return {String} The normalized string.
         * @private
         */
        normalizeSymbol: (function() {
            var hashRegEx = /#/;
            var colonRegEx = /::/;
            var normalizeFunction = function(symbolStr) {
                    if (hashRegEx.test(symbolStr)) {
                        symbolStr = symbolStr.replace(hashRegEx, '.prototype.');
                    } else if (colonRegEx.test(symbolStr)) {
                        symbolStr = symbolStr.replace(colonRegEx, '.');
                    }
                    return symbolStr;
                };
            return normalizeFunction;
        }()),
        /**
         * Checks the passed symbolStr and raises a warning if it cannot be
         * found.
         *
         * @param {String} symbolStr A string to check. Usually this string has
         *     been {@link #normalizeSymbol normalized} already.
         * @param {String} [clsName] The optional name of the class that
         *     requires the passed openlayers symbol.
         * @private
         */
        checkSymbol: function(symbolStr, clsName) {
            var isDefined = this.isDefinedSymbol(symbolStr);
            if (!isDefined) {
                Ext.log.warn('The class "' + (clsName || 'unknown') + '" ' + 'depends on the external symbol "' + symbolStr + '", ' + 'which does not seem to exist.');
            }
        },
        /**
         * Checks if the passed symbolStr is defined.
         *
         * @param {String} symbolStr A string to check. Usually this string has
         *     been {@link #normalizeSymbol normalized} already.
         * @return {Boolean} Whether the symbol is defined or not.
         * @private
         */
        isDefinedSymbol: function(symbolStr) {
            var checkedCache = this._checked;
            if (Ext.isDefined(checkedCache[symbolStr])) {
                return checkedCache[symbolStr];
            }
            var parts = symbolStr.split('.');
            var lastIdx = parts.length - 1;
            var curSymbol = Ext.getWin().dom;
            var isDefined = false;
            var intermediateSymb = '';
            Ext.each(parts, function(part, idx) {
                if (intermediateSymb !== '') {
                    intermediateSymb += '.';
                }
                intermediateSymb += part;
                if (curSymbol[part]) {
                    checkedCache[intermediateSymb] = true;
                    curSymbol = curSymbol[part];
                    if (lastIdx === idx) {
                        isDefined = true;
                    }
                } else {
                    checkedCache[intermediateSymb] = false;
                    return false;
                }
            });
            // break early
            checkedCache[symbolStr] = isDefined;
            return isDefined;
        }
    },
    /**
     * @property {String[]} symbols The symbols to check.
     */
    /**
     * Whenever a class mixes in GeoExt.mixin.SymbolCheck, this method will be
     * called and it actually runs the checks for all the defined #symbols.
     *
     * @param {Ext.Class} cls The class that this mixin is mixed into.
     * @private
     */
    onClassMixedIn: function(cls) {
        GeoExt.mixin.SymbolCheck.check(cls);
    }
});

/* Copyright (c) 2015-2017 The Open Source Geospatial Foundation
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
 * A component that renders a `ol.style.Style` with an optional `ol.Feature`.
 *
 *     @example preview
 *     var poly = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             fill: new ol.style.Fill({color: 'red'})
 *         })
 *     });
 *     var line = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             stroke: new ol.style.Stroke({color: 'orange', width: 3}),
 *         }),
 *         symbolType: 'Line'
 *     });
 *     var point = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             image: new ol.style.Circle({
 *                 radius: 7,
 *                 fill: new ol.style.Fill({color: 'gray'}),
 *                 stroke: new ol.style.Stroke({color: 'black', width: 3}),
 *             })
 *         }),
 *         symbolType: 'Point'
 *     });
 *     var star = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             image: new ol.style.RegularShape({
 *                 fill: new ol.style.Fill({color: 'blue'}),
 *                 stroke: new ol.style.Stroke({color: 'green', width: 3}),
 *                 points: 7,
 *                 radius: 15,
 *                 radius2: 7,
 *                 angle: 0
 *             })
 *         }),
 *         minWidth: 40,
 *         minHeight: 40,
 *         symbolType: 'Point'
 *     });
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Rendering of ol.Features in a panel',
 *         items: [poly, line, point, star],
 *         border: false,
 *         renderTo: Ext.getBody()
 *     });
 *
 * @class GeoExt.component.FeatureRenderer
 */
Ext.define('GeoExt.component.FeatureRenderer', {
    extend: 'Ext.Component',
    alias: 'widget.gx_renderer',
    requires: [
        'GeoExt.util.Version'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.extent.getCenter',
        'ol.extent.getWidth',
        'ol.extent.getHeight',
        'ol.Feature',
        'ol.Feature#getGeometry',
        'ol.Feature#setStyle',
        'ol.geom.Geometry#getExtent',
        'ol.geom.Point',
        'ol.geom.LineString',
        'ol.geom.Polygon',
        'ol.layer.Vector',
        'ol.layer.Vector#getSource',
        'ol.Map#getSize',
        'ol.Map#getView',
        'ol.Map#setView',
        'ol.Map#updateSize',
        'ol.proj.Projection',
        'ol.source.Vector',
        'ol.source.Vector#addFeature',
        'ol.View',
        'ol.View#fit'
    ],
    /**
     * Fires when the feature is clicked on.
     *
     * @event click
     * @param {GeoExt.component.FeatureRenderer} renderer The feature renderer.
     */
    config: {
        /**
         * Optional class to set on the feature renderer div.
         *
         * @cfg {String}
         */
        imgCls: '',
        /**
         * The minimum width.
         *
         * @cfg {Number}
         */
        minWidth: 20,
        /**
         * The minimum height.
         *
         * @cfg {Number}
         */
        minHeight: 20,
        /**
         * The resolution for the renderer.
         *
         * @cfg {Number}
         */
        resolution: 1,
        /**
         * Optional vector to be drawn.
         *
         * @cfg {ol.Feature}
         */
        feature: undefined,
        /**
         * Feature to use for point swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        pointFeature: undefined,
        /**
         * Feature to use for line swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        lineFeature: undefined,
        /**
         * Feature to use for polygon swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        polygonFeature: undefined,
        /**
         * Feature to use for text label swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        textFeature: undefined,
        /**
         * An `ol.style.Style` instance or an array of `ol.style.Style`
         * instances for rendering a  feature.  If no symbolizers are
         * provided, the default style from OpenLayers will be used.
         *
         * @cfg {ol.style.Style[]|ol.style.Style}
         */
        symbolizers: undefined,
        /**
         * One of `"Point"`, `"Line"`, `"Polygon"` or `"Text"`.  Only relevant
         * if `feature` is not provided.
         *
         * @cfg {String}
         */
        symbolType: 'Polygon'
    },
    inheritableStatics: {
        /**
         * Determines the style for the given feature record.
         *
         * @param {GeoExt.data.model.Feature} record A feature record to get the
         *     styler for.
         * @return {ol.style.Style[]|ol.style.Style} The style(s) applied to the
         *     given feature record.
         */
        determineStyle: function(record) {
            var feature = record.getFeature();
            return feature.getStyle() || feature.getStyleFunction() || (record.store ? record.store.layer.getStyle() : null);
        }
    },
    /**
     * Initialize the GeoExt.component.FeatureRenderer.
     */
    initComponent: function() {
        var me = this;
        var id = me.getId();
        me.autoEl = {
            'id': id,
            'tag': 'div',
            'class': this.getImgCls()
        };
        if (!me.getLineFeature()) {
            me.setLineFeature(new ol.Feature({
                geometry: new ol.geom.LineString([
                    [
                        -8,
                        -3
                    ],
                    [
                        -3,
                        3
                    ],
                    [
                        3,
                        -3
                    ],
                    [
                        8,
                        3
                    ]
                ])
            }));
        }
        if (!me.getPointFeature()) {
            me.setPointFeature(new ol.Feature({
                geometry: new ol.geom.Point([
                    0,
                    0
                ])
            }));
        }
        if (!me.getPolygonFeature()) {
            me.setPolygonFeature(new ol.Feature({
                geometry: new ol.geom.Polygon([
                    [
                        [
                            -8,
                            -4
                        ],
                        [
                            -6,
                            -6
                        ],
                        [
                            6,
                            -6
                        ],
                        [
                            8,
                            -4
                        ],
                        [
                            8,
                            4
                        ],
                        [
                            6,
                            6
                        ],
                        [
                            -6,
                            6
                        ],
                        [
                            -8,
                            4
                        ]
                    ]
                ])
            }));
        }
        if (!me.getTextFeature()) {
            me.setTextFeature(new ol.Feature({
                geometry: new ol.geom.Point([
                    0,
                    0
                ])
            }));
        }
        me.map = new ol.Map({
            controls: [],
            interactions: [],
            layers: [
                new ol.layer.Vector({
                    source: new ol.source.Vector()
                })
            ]
        });
        var feature = me.getFeature();
        if (!feature) {
            me.setFeature(me['get' + me.getSymbolType() + 'Feature']());
        } else {
            me.applyFeature(feature);
        }
        me.callParent();
    },
    /**
     * Draw the feature when we are rendered.
     *
     * @private
     */
    onRender: function() {
        this.callParent(arguments);
        this.drawFeature();
    },
    /**
     * After rendering we setup our own custom events using #initCustomEvents.
     *
     * @private
     */
    afterRender: function() {
        this.callParent(arguments);
        this.initCustomEvents();
    },
    /**
     * (Re-)Initializes our custom event listeners, mainly #onClick.
     *
     * @private
     */
    initCustomEvents: function() {
        var me = this;
        me.clearCustomEvents();
        me.el.on('click', me.onClick, me);
    },
    /**
     * Unbinds previously bound listeners on #el.
     *
     * @private
     */
    clearCustomEvents: function() {
        var el = this.el;
        if (el && el.clearListeners) {
            el.clearListeners();
        }
    },
    /**
     * Bound to the click event on the #el, this fires the click event.
     *
     * @private
     */
    onClick: function() {
        this.fireEvent('click', this);
    },
    /**
     * Private method called during the destroy sequence.
     *
     * @private
     */
    beforeDestroy: function() {
        var me = this;
        me.clearCustomEvents();
        if (me.map) {
            me.map.setTarget(null);
        }
    },
    /**
     * When resizing has happened, we might need to re-set the renderer's
     * dimensions via #setRendererDimensions.
     *
     * @private
     */
    onResize: function() {
        this.setRendererDimensions();
        this.callParent(arguments);
    },
    /**
     * Draw the feature in the map.
     *
     * @private
     */
    drawFeature: function() {
        var me = this;
        me.map.setTarget(me.el.id);
        // TODO why not me.el?
        me.setRendererDimensions();
    },
    /**
     * Set the dimension of our renderer, i.e. map and view.
     *
     * @private
     */
    setRendererDimensions: function() {
        var me = this;
        var gb = me.feature.getGeometry().getExtent();
        var gw = ol.extent.getWidth(gb);
        var gh = ol.extent.getHeight(gb);
        /*
         * Determine resolution based on the following rules:
         * 1) always use value specified in config
         * 2) if not specified, use max res based on width or height of element
         * 3) if no width or height, assume a resolution of 1
         */
        var resolution = me.initialConfig.resolution;
        if (!resolution) {
            resolution = Math.max(gw / me.width || 0, gh / me.height || 0) || 1;
        }
        me.map.setView(new ol.View({
            minResolution: resolution,
            maxResolution: resolution,
            projection: new ol.proj.Projection({
                code: '',
                units: 'pixels'
            })
        }));
        // determine height and width of element
        var width = Math.max(me.width || me.getMinWidth(), gw / resolution);
        var height = Math.max(me.height || me.getMinHeight(), gh / resolution);
        // determine bounds of renderer
        var center = ol.extent.getCenter(gb);
        var bhalfw = width * resolution / 2;
        var bhalfh = height * resolution / 2;
        var bounds = [
                center[0] - bhalfw,
                center[1] - bhalfh,
                center[0] + bhalfw,
                center[1] + bhalfh
            ];
        me.el.setSize(Math.round(width), Math.round(height));
        me.map.updateSize();
        // Check for backwards compatibility
        if (GeoExt.util.Version.isOl3()) {
            me.map.getView().fit(bounds, me.map.getSize());
        } else {
            me.map.getView().fit(bounds);
        }
    },
    /**
     * We're setting the symbolizers on the feature.
     *
     * @param {ol.style.Style[]|ol.style.Style} symbolizers The style (or
     *     array of styles) that have been set.
     * @return {ol.style.Style[]|ol.style.Style} The style (or
     *     array of styles) that have been set.
     * @private
     */
    applySymbolizers: function(symbolizers) {
        var feature = this.getFeature();
        if (feature && symbolizers) {
            feature.setStyle(symbolizers);
        }
        return symbolizers;
    },
    /**
     * We're setting the feature and add it to the source.
     *
     * @param {ol.Feature} feature The feature that has been set.
     * @return {ol.Feature} feature The feature that has been set.
     * @private
     */
    applyFeature: function(feature) {
        var symbolizers = this.getSymbolizers();
        if (feature && symbolizers) {
            feature.setStyle(symbolizers);
        }
        if (this.map) {
            var source = this.map.getLayers().item(0).getSource();
            source.clear();
            source.addFeature(feature);
        }
        return feature;
    },
    /**
     * Update the `feature` or `symbolizers` and redraw the feature.
     *
     * Valid options:
     *
     * @param {Object} options Object with properties to be updated.
     * @param {ol.Feature} options.feature The new or updated feature.
     * @param {ol.style.Style[]|ol.style.Style} options.symbolizers The
     *     symbolizers.
     */
    update: function(options) {
        if (options.feature) {
            this.setFeature(options.feature);
        }
        if (options.symbolizers) {
            this.setSymbolizers(options.symbolizers);
        }
    }
});

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
 * @class GeoExt.data.model.Base
 */
Ext.define('GeoExt.data.model.Base', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.identifier.Uuid'
    ],
    identifier: 'uuid',
    schema: {
        id: 'geoext-schema',
        namespace: 'GeoExt.data.model'
    },
    inheritableStatics: {
        /**
         * Loads a record from a provided data structure initializing the models
         * associations. Simply calling Ext.create will not utilize the models
         * configured reader and effectivly sidetrack associations configs.
         * This static helper method makes sure associations are initialized
         * properly and are available with the returned record.
         *
         * Be aware that the provided data may be modified by the models reader
         * initializing associations.
         *
         * @param  {Object} data The data the record will be created with.
         * @return {GeoExt.data.model.Base} The record.
         */
        loadRawData: function(data) {
            var me = this;
            var result = me.getProxy().getReader().readRecords(data || {});
            var records = result.getRecords();
            var success = result.getSuccess();
            if (success && records.length) {
                return records[0];
            }
        }
    }
});

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
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.model.Layer
 */
Ext.define('GeoExt.data.model.Layer', {
    extend: 'GeoExt.data.model.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.layer.Group',
        'ol.layer.Base',
        'ol.layer.Base#get'
    ],
    /**
     * The layer property that will be used to label the model in views.
     *
     * @cfg {String}
     */
    textProperty: 'name',
    /**
     * The layer property that will be used to describe the model in views.
     *
     * @cfg {String}
     */
    descriptionProperty: 'description',
    /**
     * The text label that will be shown in model views representing unnamed
     * layers.
     *
     * @cfg {String}
     */
    unnamedLayerText: 'Unnamed Layer',
    /**
     * The text label that will be shown in model views representing unnamed
     * group layers.
     *
     * @cfg {String}
     */
    unnamedGroupLayerText: 'Unnamed Group Layer',
    /**
     * This property specifies which properties are synchronized between
     * the store record and the ol layer object.
     *
     * By default this only the property `'title'`.
     *
     * @cfg {string[]}
     */
    synchronizedProperties: [
        'title'
    ],
    fields: [
        {
            name: 'isLayerGroup',
            type: 'boolean',
            persist: false,
            convert: function(v, record) {
                var layer = record.getOlLayer();
                if (layer) {
                    return (layer instanceof ol.layer.Group);
                } else {
                    return undefined;
                }
            }
        },
        {
            name: 'text',
            type: 'string',
            persist: false,
            convert: function(v, record) {
                var name = v;
                var defaultName;
                var textProp;
                if (!name) {
                    textProp = record.textProperty;
                    defaultName = (record.get('isLayerGroup') ? record.unnamedGroupLayerText : record.unnamedLayerText);
                    name = record.getOlLayerProp(textProp, defaultName);
                }
                return name;
            }
        },
        {
            name: 'opacity',
            type: 'number',
            persist: false,
            convert: function(v, record) {
                return record.getOlLayerProp('opacity');
            }
        },
        {
            name: 'minResolution',
            type: 'number',
            persist: false,
            convert: function(v, record) {
                return record.getOlLayerProp('minResolution');
            }
        },
        {
            name: 'maxResolution',
            type: 'number',
            persist: false,
            convert: function(v, record) {
                return record.getOlLayerProp('maxResolution');
            }
        },
        {
            name: 'qtip',
            type: 'string',
            persist: false,
            convert: function(v, record) {
                return record.getOlLayerProp(record.descriptionProperty, '');
            }
        },
        {
            name: 'qtitle',
            type: 'string',
            persist: false,
            convert: function(v, record) {
                return record.get('text');
            }
        }
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    /**
     * Returns the `ol.layer.Base` object used in this model instance.
     *
     * @return {ol.layer.Base} The `ol.layer.Base` object.
     */
    getOlLayer: function() {
        if (this.data instanceof ol.layer.Base) {
            return this.data;
        }
    },
    /**
     * Returns a property value of the `ol.layer.Base` object used in this model
     * instance. If the property is null, the optional default value will  be
     * returned.
     *
     * @param  {string} prop         The property key.
     * @param  {Object} defaultValue The optional default value.
     * @return {Object}              The returned property.
     */
    getOlLayerProp: function(prop, defaultValue) {
        var layer = this.getOlLayer();
        var value = (layer ? layer.get(prop) : undefined);
        return (value !== undefined ? value : defaultValue);
    }
});

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
 * A store that synchronizes a collection of layers (e.g. of an OpenLayers.Map)
 * with a layer store holding GeoExt.data.model.Layer instances.
 *
 * @class GeoExt.data.store.Layers
 */
Ext.define('GeoExt.data.store.Layers', {
    extend: 'Ext.data.Store',
    alternateClassName: [
        'GeoExt.data.LayerStore'
    ],
    requires: [
        'GeoExt.data.model.Layer'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.Collection#clear',
        'ol.Collection#forEach',
        'ol.Collection#getArray',
        'ol.Collection#insertAt',
        'ol.Collection#on',
        'ol.Collection#push',
        'ol.Collection#remove',
        'ol.layer.Layer',
        'ol.layer.Layer#get',
        'ol.layer.Layer#on',
        'ol.layer.Layer#set',
        'ol.Map',
        'ol.Map#getLayers'
    ],
    model: 'GeoExt.data.model.Layer',
    config: {
        /**
         * An OL map instance, whose layers will be managed by the store.
         *
         * @cfg {ol.Map} map
         */
        map: null,
        /**
         * A collection of ol.layer.Base objects, which will be managed by
         * the store.
         *
         * @cfg {ol.Collection} layers
         */
        layers: null,
        /**
         * An optional function called to filter records used in changeLayer
         * function
         *
         * @cfg {Function} changeLayerFilterFn
         */
        changeLayerFilterFn: null
    },
    /**
     * Constructs an instance of the layer store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        var me = this;
        me.onAddLayer = me.onAddLayer.bind(me);
        me.onRemoveLayer = me.onRemoveLayer.bind(me);
        me.onChangeLayer = me.onChangeLayer.bind(me);
        me.callParent([
            config
        ]);
        if (config.map) {
            this.bindMap(config.map);
        } else if (config.layers) {
            this.bindLayers(config.layers);
        }
    },
    /**
     * Bind this store to a collection of layers; once bound, the store is
     * synchronized with the layer collection and vice-versa.
     *
     * @param  {ol.Collection} layers The layer collection (`ol.layer.Base`).
     * @param  {ol.Map} map Optional map from which the layers were derived
     */
    bindLayers: function(layers, map) {
        var me = this;
        if (!me.layers) {
            me.layers = layers;
        }
        if (me.layers instanceof ol.layer.Group) {
            me.layers = me.layers.getLayers();
        }
        var mapLayers = me.layers;
        mapLayers.forEach(function(layer) {
            me.loadRawData(layer, true);
        });
        mapLayers.forEach(function(layer) {
            me.bindLayer(layer, me.getByLayer(layer));
        });
        mapLayers.on('add', me.onAddLayer);
        mapLayers.on('remove', me.onRemoveLayer);
        me.on({
            'load': me.onLoad,
            'clear': me.onClear,
            'add': me.onAdd,
            'remove': me.onRemove,
            'update': me.onStoreUpdate,
            'scope': me
        });
        me.data.on({
            'replace': me.onReplace,
            'scope': me
        });
        me.fireEvent('bind', me, map);
    },
    /**
     * Bind this store to a map instance; once bound, the store is synchronized
     * with the map and vice-versa.
     *
     * @param {ol.Map} map The map instance.
     */
    bindMap: function(map) {
        var me = this;
        if (!me.map) {
            me.map = map;
        }
        if (map instanceof ol.Map) {
            var mapLayers = map.getLayers();
            me.bindLayers(mapLayers, map);
        }
    },
    /**
     * Bind the layer to the record and initialize synchronized values.
     *
     * @param {ol.layer.Base} layer The layer.
     * @param {Ext.data.Model} record The record, if not set it will be
     *      searched for.
     */
    bindLayer: function(layer, record) {
        var me = this;
        layer.on('propertychange', me.onChangeLayer);
        Ext.Array.forEach(record.synchronizedProperties, function(prop) {
            me.synchronize(record, layer, prop);
        });
    },
    /**
     * Unbind this store from the layer collection it is currently bound.
     */
    unbindLayers: function() {
        var me = this;
        if (me.layers) {
            me.layers.un('add', me.onAddLayer);
            me.layers.un('remove', me.onRemoveLayer);
        }
        me.un('load', me.onLoad, me);
        me.un('clear', me.onClear, me);
        me.un('add', me.onAdd, me);
        me.un('remove', me.onRemove, me);
        me.un('update', me.onStoreUpdate, me);
        me.data.un('replace', me.onReplace, me);
    },
    /**
     * Unbind this store from the map it is currently bound.
     */
    unbindMap: function() {
        var me = this;
        me.unbindLayers();
        me.map = null;
    },
    /**
     * Handler for layer changes. When layer order changes, this moves the
     * appropriate record within the store.
     *
     * @param {ol.ObjectEvent} evt The emitted `ol.Object` event.
     * @private
     */
    onChangeLayer: function(evt) {
        var layer = evt.target;
        var filter = this.changeLayerFilterFn ? this.changeLayerFilterFn.bind(layer) : undefined;
        var record = this.getByLayer(layer, filter);
        if (record !== undefined) {
            if (evt.key === 'description') {
                record.set('qtip', layer.get('description'));
                if (record.synchronizedProperties.indexOf('description') > -1) {
                    this.synchronize(record, layer, 'description');
                }
            } else if (record.synchronizedProperties.indexOf(evt.key) > -1) {
                this.synchronize(record, layer, evt.key);
            } else {
                this.fireEvent('update', this, record, Ext.data.Record.EDIT, null, {});
            }
        }
    },
    /**
     * Handler for a layer collection's `add` event.
     *
     * @param {ol.CollectionEvent} evt The emitted `ol.Collection` event.
     * @private
     */
    onAddLayer: function(evt) {
        var layer = evt.element;
        var index = this.layers.getArray().indexOf(layer);
        var me = this;
        if (!me._adding) {
            me._adding = true;
            var result = me.proxy.reader.read(layer);
            me.insert(index, result.records);
            delete me._adding;
        }
        me.bindLayer(layer, me.getByLayer(layer));
    },
    /**
     * Handler for layer collection's `remove` event.
     *
     * @param {ol.CollectionEvent} evt The emitted `ol.Collection` event.
     * @private
     */
    onRemoveLayer: function(evt) {
        var me = this;
        if (!me._removing) {
            var layer = evt.element;
            var rec = me.getByLayer(layer);
            if (rec) {
                me._removing = true;
                layer.un('propertychange', me.onChangeLayer);
                me.remove(rec);
                delete me._removing;
            }
        }
    },
    /**
     * Handler for a store's `load` event.
     *
     * @param {Ext.data.Store} store The store that loaded.
     * @param {Ext.data.Model|Ext.data.Model[]} records An array of loaded model
     *      instances.
     * @param {Boolean} successful Whether loading was successful or not.
     * @private
     */
    onLoad: function(store, records, successful) {
        var me = this;
        if (successful) {
            if (!Ext.isArray(records)) {
                records = [
                    records
                ];
            }
            if (!me._addRecords) {
                me._removing = true;
                me.layers.forEach(function(layer) {
                    layer.un('propertychange', me.onChangeLayer);
                });
                me.layers.getLayers().clear();
                delete me._removing;
            }
            var len = records.length;
            if (len > 0) {
                var layers = new Array(len);
                for (var i = 0; i < len; i++) {
                    var record = records[i];
                    layers[i] = record.getOlLayer();
                    me.bindLayer(layers[i], record);
                }
                me._adding = true;
                me.layers.extend(layers);
                delete me._adding;
            }
        }
        delete me._addRecords;
    },
    /**
     * Handler for a store's `clear` event.
     *
     * @private
     */
    onClear: function() {
        var me = this;
        me._removing = true;
        me.layers.forEach(function(layer) {
            layer.un('propertychange', me.onChangeLayer);
        });
        me.layers.clear();
        delete me._removing;
    },
    /**
     * Handler for a store's `add` event.
     *
     * @param {Ext.data.Store} store The store to which a model instance was
     *     added.
     * @param {Ext.data.Model[]} records The array of model instances that were
     *     added.
     * @param {Number} index The index at which the model instances were added.
     * @private
     */
    onAdd: function(store, records, index) {
        var me = this;
        if (!me._adding) {
            me._adding = true;
            var layer;
            for (var i = 0,
                ii = records.length; i < ii; ++i) {
                layer = records[i].getOlLayer();
                me.bindLayer(layer, records[i]);
                if (index === 0) {
                    me.layers.push(layer);
                } else {
                    me.layers.insertAt(index, layer);
                }
            }
            delete me._adding;
        }
    },
    /**
     * Handler for a store's `remove` event.
     *
     * @param {Ext.data.Store} store The store from which a model instances
     *     were removed.
     * @param {Ext.data.Model[]} records The array of model instances that were
     *     removed.
     * @private
     */
    onRemove: function(store, records) {
        var me = this;
        var record;
        var layer;
        var found;
        var i;
        var ii;
        if (!me._removing) {
            var compareFunc = function(el) {
                    if (el === layer) {
                        found = true;
                    }
                };
            for (i = 0 , ii = records.length; i < ii; ++i) {
                record = records[i];
                layer = record.getOlLayer();
                found = false;
                layer.un('propertychange', me.onChangeLayer);
                me.layers.forEach(compareFunc);
                if (found) {
                    me._removing = true;
                    me.removeMapLayer(record);
                    delete me._removing;
                }
            }
        }
    },
    /**
     * Handler for a store's `update` event.
     *
     * @param {Ext.data.Store} store The store which was updated.
     * @param {Ext.data.Model} record The updated model instance.
     * @param {String} operation The operation, either Ext.data.Model.EDIT,
     *     Ext.data.Model.REJECT or Ext.data.Model.COMMIT.
     * @param {string[]|null} modifiedFieldNames The fieldnames that were
     *     modified in this operation.
     * @private
     */
    onStoreUpdate: function(store, record, operation, modifiedFieldNames) {
        var me = this;
        if (operation === Ext.data.Record.EDIT) {
            if (modifiedFieldNames) {
                var layer = record.getOlLayer();
                Ext.Array.forEach(modifiedFieldNames, function(prop) {
                    if (record.synchronizedProperties.indexOf(prop) > -1) {
                        me.synchronize(layer, record, prop);
                    }
                });
            }
        }
    },
    /**
     * Removes a record's layer from the bound map.
     *
     * @param {Ext.data.Model} record The removed model instance.
     * @private
     */
    removeMapLayer: function(record) {
        this.layers.remove(record.getOlLayer());
    },
    /**
     * Handler for a store's data collections' `replace` event.
     *
     * @param {String} key The associated key.
     * @param {Ext.data.Model} oldRecord In this case, a record that has
     *     been replaced.
     * @private
     */
    onReplace: function(key, oldRecord) {
        this.removeMapLayer(oldRecord);
    },
    /**
     * Get the record for the specified layer.
     *
     * @param {ol.layer.Base} layer The layer to get a model instance for.
     * @param {function(Ext.data.Model): boolean} [filterFn] A filter function
     * @return {Ext.data.Model} The corresponding model instance or undefined if
     *     not found.
     */
    getByLayer: function(layer, filterFn) {
        var me = this;
        var index;
        if (Ext.isFunction(filterFn)) {
            index = me.findBy(filterFn);
        } else {
            index = me.findBy(function(rec) {
                return rec.getOlLayer() === layer;
            });
        }
        if (index > -1) {
            return me.getAt(index);
        }
    },
    /**
     * Unbinds listeners by calling #unbindMap (thus #unbindLayers) prior to
     * being destroyed.
     *
     * @private
     */
    destroy: function() {
        // unbindMap calls unbindLayers
        this.unbindMap();
        this.callParent();
    },
    /**
     * Overload loadRecords to set a flag if `addRecords` is `true` in the load
     * options. ExtJS does not pass the load options to "load" callbacks, so
     * this is how we provide that information to `onLoad`.
     *
     * @param {Ext.data.Model[]} records The array of records to load.
     * @param {Object} options The loading options.
     * @param {Boolean} [options.addRecords=false] Pass `true` to add these
     *     records to the existing records, `false` to remove the Store's
     *     existing records first.
     * @private
     */
    loadRecords: function(records, options) {
        if (options && options.addRecords) {
            this._addRecords = true;
        }
        this.callParent(arguments);
    },
    /**
     * @inheritdoc
     *
     * The event firing behaviour of Ext.4.1 is reestablished here. See also:
     * [This discussion on the Sencha forum](http://www.sencha.com/forum/
     * showthread.php?253596-beforeload-is-not-fired-by-loadRawData).
     */
    loadRawData: function(data, append) {
        var me = this;
        var result = me.proxy.reader.read(data);
        var records = result.records;
        if (result.success) {
            me.totalCount = result.total;
            me.loadRecords(records, append ? me.addRecordsOptions : undefined);
            me.fireEvent('load', me, records, true);
        }
    },
    /**
     * This function synchronizes a value, but only sets it if it is different.
     * @param {Ext.data.Model|ol.layer.Base} destination The destination.
     * @param {Ext.data.Model|ol.layer.Base} source The source.
     * @param {string} prop The property that should get synchronized.
     */
    synchronize: function(destination, source, prop) {
        var value = source.get(prop);
        if (value !== destination.get(prop)) {
            destination.set(prop, value);
        }
    }
});

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
 * A component that renders an `ol.Map` and that can be used in any ExtJS
 * layout.
 *
 * An example: A map component rendered inside of a panel:
 *
 *     @example preview
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: new ol.Map({
 *             layers: [
 *                 new ol.layer.Tile({
 *                     source: new ol.source.OSM()
 *                 })
 *             ],
 *             view: new ol.View({
 *                 center: ol.proj.fromLonLat([-8.751278, 40.611368]),
 *                 zoom: 12
 *             })
 *         })
 *     });
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'GeoExt.component.Map Example',
 *         height: 200,
 *         items: [mapComponent],
 *         renderTo: Ext.getBody()
 *     });
 *
 * @class GeoExt.component.Map
 */
Ext.define('GeoExt.component.Map', {
    extend: 'Ext.Component',
    alias: [
        'widget.gx_map',
        'widget.gx_component_map'
    ],
    requires: [
        'GeoExt.data.store.Layers',
        'GeoExt.util.Version'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.layer.Base',
        'ol.Map',
        'ol.Map#addLayer',
        'ol.Map#getLayers',
        'ol.Map#getSize',
        'ol.Map#getView',
        'ol.Map#removeLayer',
        'ol.Map#setTarget',
        'ol.Map#setView',
        'ol.Map#updateSize',
        'ol.View',
        'ol.View#calculateExtent',
        'ol.View#fit',
        'ol.View#getCenter',
        'ol.View#setCenter'
    ],
    /**
     * @event pointerrest
     *
     * Fires if the user has left the pointer for an amount
     * of #pointerRestInterval milliseconds at the *same location*. Use the
     * configuration #pointerRestPixelTolerance to configure how long a pixel is
     * considered to be on the *same location*.
     *
     * Please note that this event will only fire if the map has #pointerRest
     * configured with `true`.
     *
     * @param {ol.MapBrowserEvent} olEvt The original and most recent
     *     MapBrowserEvent event.
     * @param {ol.Pixel} lastPixel The originally captured pixel, which defined
     *     the center of the tolerance bounds (itself configurable with the the
     *     configuration #pointerRestPixelTolerance). If this is null, a
     *     completely *new* pointerrest event just happened.
     */
    /**
     * @event pointerrestout
     *
     * Fires if the user first was resting his pointer on the map element, but
     * then moved the pointer out of the map completely.
     *
     * Please note that this event will only fire if the map has #pointerRest
     * configured with `true`.
     *
     * @param {ol.MapBrowserEvent} olEvt The MapBrowserEvent event.
     */
    /**
     * @event aftermapmove
     *
     * Triggered when the 'moveend' event of the underlying OpenLayers map is
     * fired.
     *
     * @param {GeoExt.component.Map} this
     * @param {ol.Map} olMap The OpenLayers map firing the original 'moveend'
     *     event
     * @param {ol.MapEvent} olEvt The original OpenLayers event
     */
    stateEvents: [
        'aftermapmove'
    ],
    config: {
        /**
         * A configured map or a configuration object for the map constructor.
         *
         * @cfg {ol.Map} map
         */
        map: null,
        /**
         * A boolean flag to control whether the map component will fire the
         * events #pointerrest and #pointerrestout. If this is set to `false`
         * (the default), no such events will be fired.
         *
         * @cfg {Boolean} pointerRest Whether the component shall provide the
         *     `pointerrest` and `pointerrestout` events.
         */
        pointerRest: false,
        /**
         * The amount of milliseconds after which we will consider a rested
         * pointer as `pointerrest`. Only relevant if #pointerRest is `true`.
         *
         * @cfg {Number} pointerRestInterval The interval in milliseconds.
         */
        pointerRestInterval: 1000,
        /**
         * The amount of pixels that a pointer may move in both vertical and
         * horizontal direction, and still be considered to be a #pointerrest.
         * Only relevant if #pointerRest is `true`.
         *
         * @cfg {Number} pointerRestPixelTolerance The tolerance in pixels.
         */
        pointerRestPixelTolerance: 3,
        /**
         * List of css selectors for the element(s) on which neither
         * the pointerrest event, nor the pointerrestout event
         * should be fired.
         *
         * @cfg {String[]} ignorePointerRestSelectors The css selectors
         *      on which no `pointerrest` and `pointerrestout` events
         *      should be fired.
         */
        ignorePointerRestSelectors: []
    },
    /**
     * Whether we already rendered an ol.Map in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,
    /**
     * @property {GeoExt.data.store.Layers} layerStore
     * @private
     */
    layerStore: null,
    /**
     * The location of the last mousemove which we track to be able to fire
     * the #pointerrest event. Only usable if #pointerRest is `true`.
     *
     * @property {ol.Pixel} lastPointerPixel
     * @private
     */
    lastPointerPixel: null,
    /**
     * Whether the pointer is currently over the map component. Only usable if
     * the configuration #pointerRest is `true`.
     *
     * @property {Boolean} isMouseOverMapEl
     * @private
     */
    isMouseOverMapEl: null,
    /**
     * @inheritdoc
     */
    constructor: function(config) {
        var me = this;
        me.callParent([
            config
        ]);
        if (!(me.getMap() instanceof ol.Map)) {
            var olMap = new ol.Map({
                    view: new ol.View({
                        center: [
                            0,
                            0
                        ],
                        zoom: 2
                    })
                });
            me.setMap(olMap);
        }
        me.layerStore = Ext.create('GeoExt.data.store.Layers', {
            storeId: me.getId() + '-store',
            map: me.getMap()
        });
        me.bindStateOlEvents();
        me.on('resize', me.onResize, me);
    },
    /**
     * (Re-)render the map when size changes.
     */
    onResize: function() {
        // Get the corresponding view of the controller (the mapComponent).
        var me = this;
        if (!me.mapRendered) {
            var el = me.getTargetEl ? me.getTargetEl() : me.element;
            me.getMap().setTarget(el.dom);
            me.mapRendered = true;
        } else {
            me.getMap().updateSize();
        }
    },
    /**
     * Will contain a buffered version of #unbufferedPointerMove, but only if
     * the configuration #pointerRest is true.
     *
     * @private
     */
    bufferedPointerMove: Ext.emptyFn,
    /**
     * Bound as a eventlistener for pointermove on the OpenLayers map, but only
     * if the configuration #pointerRest is true. Will eventually fire the
     * special events #pointerrest or #pointerrestout.
     *
     * @param {ol.MapBrowserEvent} olEvt The MapBrowserEvent event.
     * @private
     */
    unbufferedPointerMove: function(olEvt) {
        var me = this;
        var tolerance = me.getPointerRestPixelTolerance();
        var pixel = olEvt.pixel;
        if (me.isMouseOverIgnoreEl(olEvt)) {
            return;
        }
        if (!me.isMouseOverMapEl) {
            me.fireEvent('pointerrestout', olEvt);
            return;
        }
        if (me.lastPointerPixel) {
            var deltaX = Math.abs(me.lastPointerPixel[0] - pixel[0]);
            var deltaY = Math.abs(me.lastPointerPixel[1] - pixel[1]);
            if (deltaX > tolerance || deltaY > tolerance) {
                me.lastPointerPixel = pixel;
            } else {
                // fire pointerrest, and include the original pointer pixel
                me.fireEvent('pointerrest', olEvt, me.lastPointerPixel);
                return;
            }
        } else {
            me.lastPointerPixel = pixel;
        }
        // a new pointerrest event, the second argument (the 'original' pointer
        // pixel) must be null, as we start from a totally new position
        me.fireEvent('pointerrest', olEvt, null);
    },
    /**
     * Checks if the mouse is positioned over
     * an ignore element.
     * @return {Boolean} Whether the mouse is positioned over an ignore element.
     */
    isMouseOverIgnoreEl: function() {
        var me = this;
        var selectors = me.getIgnorePointerRestSelectors();
        if (selectors === undefined || selectors.length === 0) {
            return false;
        }
        var hoverEls = Ext.query(':hover');
        return hoverEls.some(function(el) {
            return selectors.some(function(sel) {
                return el.matches(sel);
            });
        });
    },
    /**
     * Creates #bufferedPointerMove from #unbufferedPointerMove and binds it
     * to `pointermove` on the OpenLayers map.
     *
     * @private
     */
    registerPointerRestEvents: function() {
        var me = this;
        var map = me.getMap();
        if (me.bufferedPointerMove === Ext.emptyFn) {
            me.bufferedPointerMove = Ext.Function.createBuffered(me.unbufferedPointerMove, me.getPointerRestInterval(), me);
        }
        // Check if we have to fire any pointer* events
        map.on('pointermove', me.bufferedPointerMove);
        if (!me.rendered) {
            // make sure we do not fire any if the pointer left the component
            me.on('afterrender', me.bindOverOutListeners, me);
        } else {
            me.bindOverOutListeners();
        }
    },
    /**
     * Registers listeners that'll take care of setting #isMouseOverMapEl to
     * correct values.
     *
     * @private
     */
    bindOverOutListeners: function() {
        var me = this;
        var mapEl = me.getTargetEl ? me.getTargetEl() : me.element;
        if (mapEl) {
            mapEl.on({
                mouseover: me.onMouseOver,
                mouseout: me.onMouseOut,
                scope: me
            });
        }
    },
    /**
     * Unregisters listeners that'll take care of setting #isMouseOverMapEl to
     * correct values.
     *
     * @private
     */
    unbindOverOutListeners: function() {
        var me = this;
        var mapEl = me.getTargetEl ? me.getTargetEl() : me.element;
        if (mapEl) {
            mapEl.un({
                mouseover: me.onMouseOver,
                mouseout: me.onMouseOut,
                scope: me
            });
        }
    },
    /**
     * Sets isMouseOverMapEl to true, see #pointerRest.
     *
     * @private
     */
    onMouseOver: function() {
        this.isMouseOverMapEl = true;
    },
    /**
     * Sets isMouseOverMapEl to false, see #pointerRest.
     *
     * @private
     */
    onMouseOut: function() {
        this.isMouseOverMapEl = false;
    },
    /**
     * Unregisters the #bufferedPointerMove event listener and unbinds the
     * over- and out-listeners.
     */
    unregisterPointerRestEvents: function() {
        var me = this;
        var map = me.getMap();
        me.unbindOverOutListeners();
        if (map) {
            map.un('pointermove', me.bufferedPointerMove);
        }
        me.bufferedPointerMove = Ext.emptyFn;
    },
    /**
     * Whenever the value of #pointerRest is changed, this method will take
     * care of registering or unregistering internal event listeners.
     *
     * @param {Boolean} val The new value that someone set for `pointerRest`.
     * @return {Boolean} The passed new value for `pointerRest` unchanged.
     */
    applyPointerRest: function(val) {
        if (val) {
            this.registerPointerRestEvents();
        } else {
            this.unregisterPointerRestEvents();
        }
        return val;
    },
    /**
     * Whenever the value of #pointerRestInterval is changed, this method will
     * take to reinitialize the #bufferedPointerMove method and handlers to
     * actually trigger the event.
     *
     * @param {Boolean} val The new value that someone set for
     *     `pointerRestInterval`.
     * @return {Boolean} The passed new value for `pointerRestInterval`
     *     unchanged.
     */
    applyPointerRestInterval: function(val) {
        var me = this;
        var isEnabled = me.getPointerRest();
        if (isEnabled) {
            // Toggle to rebuild the buffered pointer move.
            me.setPointerRest(false);
            me.setPointerRest(isEnabled);
        }
        return val;
    },
    /**
     * Returns the center coordinate of the view.
     *
     * @return {ol.Coordinate} The center of the map view as `ol.Coordinate`.
     */
    getCenter: function() {
        return this.getMap().getView().getCenter();
    },
    /**
     * Set the center of the view.
     *
     * @param {ol.Coordinate} center The new center as `ol.Coordinate`.
     */
    setCenter: function(center) {
        this.getMap().getView().setCenter(center);
    },
    /**
     * Returns the extent of the current view.
     *
     * @return {ol.Extent} The extent of the map view as `ol.Extent`.
     */
    getExtent: function() {
        return this.getView().calculateExtent(this.getMap().getSize());
    },
    /**
     * Set the extent of the view.
     *
     * @param {ol.Extent} extent The extent as `ol.Extent`.
     */
    setExtent: function(extent) {
        // Check for backwards compatibility
        if (GeoExt.util.Version.isOl3()) {
            this.getView().fit(extent, this.getMap().getSize());
        } else {
            this.getView().fit(extent);
        }
    },
    /**
     * Returns the layers of the map.
     *
     * @return {ol.Collection} The layer collection.
     */
    getLayers: function() {
        return this.getMap().getLayers();
    },
    /**
     * Add a layer to the map.
     *
     * @param {ol.layer.Base} layer The layer to add.
     */
    addLayer: function(layer) {
        if (layer instanceof ol.layer.Base) {
            this.getMap().addLayer(layer);
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' as it is not ' + 'an instance of ol.layer.Base');
        }
    },
    /**
     * Remove a layer from the map.
     *
     * @param {ol.layer.Base} layer The layer to remove.
     */
    removeLayer: function(layer) {
        if (layer instanceof ol.layer.Base) {
            if (Ext.Array.contains(this.getLayers().getArray(), layer)) {
                this.getMap().removeLayer(layer);
            }
        } else {
            Ext.Error.raise('Can not remove layer ' + layer + ' as it is not ' + 'an instance of ol.layer.Base');
        }
    },
    /**
     * Returns the `GeoExt.data.store.Layers`.
     *
     * @return {GeoExt.data.store.Layers} The layer store.
     */
    getStore: function() {
        return this.layerStore;
    },
    /**
     * Returns the view of the map.
     *
     * @return {ol.View} The `ol.View` of the map.
     */
    getView: function() {
        return this.getMap().getView();
    },
    /**
     * Set the view of the map.
     *
     * @param {ol.View} view The `ol.View` to use for the map.
     */
    setView: function(view) {
        this.getMap().setView(view);
    },
    /**
     * Forwards the OpenLayers events so they become usable in the #statedEvents
     * array and a possible `GeoExt.state.PermalinkProvider` can change the
     * state when one of the events gets fired.
     */
    bindStateOlEvents: function() {
        var me = this;
        var olMap = me.getMap();
        olMap.on('moveend', function(evt) {
            me.fireEvent('aftermapmove', me, olMap, evt);
        });
    },
    /**
     * Returns the state of the map as keyed object. The following keys will be
     * available:
     *
     * * `center`
     * * `zoom`
     * * `rotation`
     *
     * @return {Object} The state object
     * @private
     */
    getState: function() {
        var me = this;
        var view = me.getMap().getView();
        return {
            zoom: view.getZoom(),
            center: view.getCenter(),
            rotation: view.getRotation()
        };
    },
    /**
     * Apply the provided map state object. The following keys are interpreted:
     *
     * * `center`
     * * `zoom`
     * * `rotation`
     *
     * @param  {Object} mapState The state object
     */
    applyState: function(mapState) {
        // exit if no map state is provided
        if (!Ext.isObject(mapState)) {
            return;
        }
        var me = this;
        var view = me.getMap().getView();
        view.setCenter(mapState.center);
        view.setZoom(mapState.zoom);
        view.setRotation(mapState.rotation);
    }
});

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
 * A utility class for working with OpenLayers layers.
 *
 * @class GeoExt.util.Layer
 */
Ext.define('GeoExt.util.Layer', {
    inheritableStatics: {
        /**
         * Cascades down a given LayerGroup, calling the given function for
         * each LayerGroup / Layer.
         *
         * @param  {ol.layer.Group} lyrGroup The layer group to cascade down
         * @param  {Function} fn A function to call on every LayerGroup / Layer
         * @return {void}
         */
        cascadeLayers: function(lyrGroup, fn) {
            if (!(lyrGroup instanceof ol.layer.Group)) {
                // skip on wrong input type
                Ext.Logger.warn('No ol.layer.Group given to ' + 'BasiGX.util.Layer.cascadeLayers. It is unlikely that ' + 'this will work properly. Skipping!');
                return;
            }
            if (!Ext.isFunction(fn)) {
                Ext.Logger.warn('No function passed ' + 'this will not work. Skipping!');
                return;
            }
            lyrGroup.getLayers().forEach(function(layerOrGroup) {
                fn(layerOrGroup);
                if (layerOrGroup instanceof ol.layer.Group) {
                    GeoExt.util.Layer.cascadeLayers(layerOrGroup, fn);
                }
            });
        },
        /**
         * A utility method to find the `ol.layer.Group` which is the direct
         * parent of the passed layer. Searching starts at the passed
         * startGroup. If `undefined` is returned, the layer is not a child of
         * the `startGroup`.
         *
         * @param {ol.layer.Base} childLayer The layer whose group we want.
         * @param {ol.layer.Group} startGroup The group layer that we will start
         *     searching in.
         * @return {ol.layer.Group} The direct parent group or undefined if the
         *     group cannot be determined.
         */
        findParentGroup: function(childLayer, startGroup) {
            var parentGroup;
            var findParentGroup = GeoExt.util.Layer.findParentGroup;
            var getLayerIndex = GeoExt.util.Layer.getLayerIndex;
            if (getLayerIndex(childLayer, startGroup) !== -1) {
                parentGroup = startGroup;
            } else {
                startGroup.getLayers().forEach(function(layer) {
                    if (!parentGroup && layer instanceof ol.layer.Group) {
                        parentGroup = findParentGroup(childLayer, layer);
                    }
                });
            }
            // sadly we cannot abort the forEach-iteration here
            return parentGroup;
        },
        /**
         * A utility method to determine the zero based index of a layer in a
         * layer group. Will return `-1` if the layer isn't a direct child of
         * the group.
         *
         * @param {ol.layer.Base} layer The layer whose index we want.
         * @param {ol.layer.Group} group The group to search in.
         * @return {Number} The index or `-1` if the layer isn't a direct child
         *     of the group.
         */
        getLayerIndex: function(layer, group) {
            var index = -1;
            group.getLayers().forEach(function(candidate, idx) {
                if (index === -1 && candidate === layer) {
                    index = idx;
                }
            });
            // sadly we cannot abort the forEach-iteration here
            return index;
        }
    }
});

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
        'widget.gx_component_overviewmap'
    ],
    requires: [
        'GeoExt.util.Version',
        'GeoExt.util.Layer'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
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
        'ol.layer.Image',
        // we should get rid of this requirement
        'ol.layer.Tile',
        // we should get rid of this requirement
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
        'ol.View#un'
    ],
    inheritableStatics: {
        /**
         * Returns an object with geometries representing the extent of the
         * passed map and the top left point.
         *
         * @param {ol.Map} map The map to the extent and top left corner
         *     geometries from.
         * @return {Object} An object with keys `extent` and `topLeft`.
         */
        getVisibleExtentGeometries: function(map) {
            var mapSize = map && map.getSize();
            var w = mapSize && mapSize[0];
            var h = mapSize && mapSize[1];
            if (!mapSize || isNaN(w) || isNaN(h)) {
                return;
            }
            var pixels = [
                    [
                        0,
                        0
                    ],
                    [
                        w,
                        0
                    ],
                    [
                        w,
                        h
                    ],
                    [
                        0,
                        h
                    ],
                    [
                        0,
                        0
                    ]
                ];
            var extentCoords = [];
            Ext.each(pixels, function(pixel) {
                var coord = map.getCoordinateFromPixel(pixel);
                if (coord === null) {
                    return false;
                }
                extentCoords.push(coord);
            });
            if (extentCoords.length !== 5) {
                return;
            }
            var geom = new ol.geom.Polygon([
                    extentCoords
                ]);
            var anchor = new ol.geom.Point(extentCoords[0]);
            return {
                extent: geom,
                topLeft: anchor
            };
        }
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
         * @cfg {Number} magnification
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
         * @cfg {Boolean} recenterOnClick Whether we shall recenter the parent
         *     map on a click on the overview map or not.
         */
        recenterOnClick: true,
        /**
         * Shall the extent box on the overview map be draggable to recenter the
         * parent map?
         *
         * @cfg {Boolean} enableBoxDrag Whether we shall make the box feature of
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
         * @cfg {Number} recenterDuration Amount of milliseconds for panning
         *     the parent map to the clicked location or the new center of the
         *     box feature.
         */
        recenterDuration: 500
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
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,
    /**
     * The constructor of the OverviewMap component.
     */
    constructor: function() {
        this.initOverviewFeatures();
        this.callParent(arguments);
    },
    /**
     * Initializes the GeoExt.component.OverviewMap.
     */
    initComponent: function() {
        var me = this;
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
    initOverviewFeatures: function() {
        var me = this;
        me.boxFeature = new ol.Feature();
        me.anchorFeature = new ol.Feature();
        me.extentLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
    },
    /**
     * Initializes the #map from the configuration and the #parentMap.
     *
     * @private
     */
    initOverviewMap: function() {
        var me = this;
        var parentMap = me.getParentMap();
        me.getLayers().push(me.extentLayer);
        if (!me.getMap()) {
            var parentView = parentMap.getView();
            var olMap = new ol.Map({
                    controls: new ol.Collection(),
                    interactions: new ol.Collection(),
                    view: new ol.View({
                        center: parentView.getCenter(),
                        zoom: parentView.getZoom(),
                        projection: parentView.getProjection()
                    })
                });
            me.setMap(olMap);
        }
        GeoExt.util.Layer.cascadeLayers(parentMap.getLayerGroup(), function(layer) {
            if (me.getLayers().indexOf(layer) > -1) {
                throw new Error('OverviewMap cannot use layers of the ' + 'parent map. (Since ol v6.0.0 maps cannot share ' + 'layers anymore)');
            }
        });
        Ext.each(me.getLayers(), function(layer) {
            me.getMap().addLayer(layer);
        });
        // Set the OverviewMaps center or resolution, on property changed
        // in parentMap.
        parentMap.getView().on('propertychange', me.onParentViewPropChange.bind(me));
        // Update the box after rendering a new frame of the parentMap.
        me.enableBoxUpdate();
        // Initially set the center and resolution of the overviewMap.
        me.setOverviewMapProperty('center');
        me.setOverviewMapProperty('resolution');
        me.extentLayer.getSource().addFeatures([
            me.boxFeature,
            me.anchorFeature
        ]);
    },
    /**
     * Enable everything we need to be able to drag the extent box on the
     * overview map, and to properly handle drag events (e.g. recenter on
     * finished dragging).
     */
    setupDragBehaviour: function() {
        var me = this;
        var dragInteraction = new ol.interaction.Translate({
                features: new ol.Collection([
                    me.boxFeature
                ])
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
    disableBoxUpdate: function() {
        var me = this;
        var parentMap = me.getParentMap();
        if (parentMap) {
            parentMap.un('postrender', me.updateBox, me);
        }
    },
    /**
     * Enables the update of the box by binding the updateBox function
     * to the postrender event of the parent map.
     */
    enableBoxUpdate: function() {
        var me = this;
        var parentMap = me.getParentMap();
        if (parentMap) {
            parentMap.on('postrender', me.updateBox.bind(me));
        }
    },
    /**
     * Disable / destroy everything we need to be able to drag the extent box on
     * the overview map. Unregisters any events we might have added and removes
     * the `ol.interaction.Translate`.
     */
    destroyDragBehaviour: function() {
        var me = this;
        var dragInteraction = me.dragInteraction;
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
    repositionAnchorFeature: function() {
        var me = this;
        var boxCoords = me.boxFeature.getGeometry().getCoordinates();
        var topLeftCoord = boxCoords[0][0];
        var newAnchorGeom = new ol.geom.Point(topLeftCoord);
        me.anchorFeature.setGeometry(newAnchorGeom);
    },
    /**
     * Recenters the #parentMap to the center of the extent of the #boxFeature.
     * Called when dragging of the #boxFeature ends.
     */
    recenterParentFromBox: function() {
        var me = this;
        var parentMap = me.getParentMap();
        var parentView = parentMap.getView();
        var parentProjection = parentView.getProjection();
        var overviewMap = me.getMap();
        var overviewView = overviewMap.getView();
        var overviewProjection = overviewView.getProjection();
        var currentMapCenter = parentView.getCenter();
        var boxExtent = me.boxFeature.getGeometry().getExtent();
        var boxCenter = ol.extent.getCenter(boxExtent);
        // transform if necessary
        if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
            boxCenter = ol.proj.transform(boxCenter, overviewProjection, parentProjection);
        }
        // Check for backwards compatibility
        if (GeoExt.util.Version.isOl3()) {
            var panAnimation = ol.animation.pan({
                    duration: me.getRecenterDuration(),
                    source: currentMapCenter
                });
            parentMap.beforeRender(panAnimation);
            parentView.setCenter(boxCenter);
        } else {
            parentView.animate({
                center: boxCenter
            });
        }
    },
    /**
     * Called when a property of the parent maps view changes.
     *
     * @param {ol.ObjectEvent} evt The event emitted by the `ol.Object`.
     * @private
     */
    onParentViewPropChange: function(evt) {
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
    overviewMapClicked: function(evt) {
        var me = this;
        var parentMap = me.getParentMap();
        var parentView = parentMap.getView();
        var parentProjection = parentView.getProjection();
        var currentMapCenter = parentView.getCenter();
        var overviewMap = me.getMap();
        var overviewView = overviewMap.getView();
        var overviewProjection = overviewView.getProjection();
        var newCenter = evt.coordinate;
        // transform if necessary
        if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
            newCenter = ol.proj.transform(newCenter, overviewProjection, parentProjection);
        }
        // Check for backwards compatibility
        if (GeoExt.util.Version.isOl3()) {
            var panAnimation = ol.animation.pan({
                    duration: me.getRecenterDuration(),
                    source: currentMapCenter
                });
            parentMap.beforeRender(panAnimation);
            parentView.setCenter(newCenter);
        } else {
            parentView.animate({
                center: newCenter
            });
        }
    },
    /**
     * Updates the Geometry of the extentLayer.
     */
    updateBox: function() {
        var me = this;
        var parentMap = me.getParentMap();
        var extentGeometries = me.self.getVisibleExtentGeometries(parentMap);
        if (!extentGeometries) {
            return;
        }
        var geom = extentGeometries.extent;
        var anchor = extentGeometries.topLeft;
        var parentMapProjection = parentMap.getView().getProjection();
        var overviewProjection = me.getMap().getView().getProjection();
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
     * @param {String} key The name of the property, either `'center'` or
     *     `'resolution'`
     */
    setOverviewMapProperty: function(key) {
        var me = this;
        var parentView = me.getParentMap().getView();
        var parentProjection = parentView.getProjection();
        var overviewView = me.getMap().getView();
        var overviewProjection = overviewView.getProjection();
        var overviewCenter = parentView.getCenter();
        if (key === 'center') {
            // transform if necessary
            if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
                overviewCenter = ol.proj.transform(overviewCenter, parentProjection, overviewProjection);
            }
            overviewView.set('center', overviewCenter);
        }
        if (key === 'resolution') {
            if (ol.proj.equivalent(parentProjection, overviewProjection)) {
                overviewView.set('resolution', me.getMagnification() * parentView.getResolution());
            } else if (me.mapRendered === true) {
                var parentExtent = parentView.calculateExtent(me.getParentMap().getSize());
                var parentExtentProjected = ol.proj.transformExtent(parentExtent, parentProjection, overviewProjection);
                // call fit to assure that resolutions are available on
                // overviewView
                overviewView.fit(parentExtentProjected);
                overviewView.set('resolution', me.getMagnification() * overviewView.getResolution());
            }
        }
    },
    // Do nothing when parent and overview projections are not
    // equivalent and mapRendered is false as me.getMap().getSize()
    // would not be reliable here.
    // Note: As soon as mapRendered will be set to true (in onResize())
    // setOverviewMapProperty('resolution') will be called explicitly
    /**
     * The applier for the #recenterOnClick configuration. Takes care of
     * initially registering an appropriate eventhandler and also unregistering
     * if the property changes.
     *
     * @param {Boolean} shallRecenter The value for #recenterOnClick that was
     *     set.
     * @return {Boolean} The value for #recenterOnClick that was passed.
     */
    applyRecenterOnClick: function(shallRecenter) {
        var me = this;
        var map = me.getMap();
        if (!map) {
            me.addListener('afterrender', function() {
                // set the property again, and re-trigger the 'apply…'-sequence
                me.setRecenterOnClick(shallRecenter);
            }, me, {
                single: true
            });
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
     * @param {Boolean} shallEnableBoxDrag The value for #enableBoxDrag that was
     *     set.
     * @return {Boolean} The value for #enableBoxDrag that was passed.
     */
    applyEnableBoxDrag: function(shallEnableBoxDrag) {
        var me = this;
        var map = me.getMap();
        if (!map) {
            me.addListener('afterrender', function() {
                // set the property again, and re-trigger the 'apply…'-sequence
                me.setEnableBoxDrag(shallEnableBoxDrag);
            }, me, {
                single: true
            });
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
    onBeforeDestroy: function() {
        var me = this;
        var map = me.getMap();
        var parentMap = me.getParentMap();
        var parentView = parentMap && parentMap.getView();
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
    onResize: function() {
        // Get the corresponding view of the controller (the mapPanel).
        var me = this;
        var div = me.getEl().dom;
        var map = me.getMap();
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
    applyAnchorStyle: function(style) {
        this.anchorFeature.setStyle(style);
        return style;
    },
    /**
     * The applier for the box style.
     *
     * @param {ol.Style} style The new style for the box feature that was set.
     * @return {ol.Style} The new style for the box feature.
     */
    applyBoxStyle: function(style) {
        this.boxFeature.setStyle(style);
        return style;
    }
});

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
 * An GeoExt.component.Popup can be used to displays a popup over the map.
 *
 * Example (hover over anything in the map to see a popup):
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
 *             zoom: 12
 *         })
 *     })
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: olMap,
 *         pointerRest: true,
 *         pointerRestInterval: 750,
 *         pointerRestPixelTolerance: 5,
 *         renderTo: Ext.getBody(),
 *         height: 200
 *     });
 *     var popup = Ext.create('GeoExt.component.Popup', {
 *         map: olMap,
 *         width: 140
 *     });
 *     mapComponent.on('pointerrest', function(evt) {
 *         var coord = evt.coordinate;
 *         var transformed = ol.proj.toLonLat(coord);
 *         var hdms = ol.coordinate.toStringHDMS(transformed);
 *         hdms = hdms.replace(/([NS])/, '$1<br>');
 *         popup.setHtml('<p><strong>Pointer rested on</strong>' +
 *                 '<br /><code>' + hdms + '</code></p>');
 *         popup.position(coord);
 *         popup.show();
 *     });
 *     mapComponent.on('pointerrestout', popup.hide, popup);
 *
 * The above example loads the provided CSS-file `resources/css/gx-popup.css`
 * and also uses the following inline CSS:
 *
 *     .gx-popup p {
 *         padding: 5px 5px 0 5px;
 *         border-radius: 7px;
 *         background-color: rgba(255,255,255,0.85);
 *         border: 3px solid white;
 *         margin: 0;
 *         text-align: center;
 *     }
 *
 * @class GeoExt.component.Popup
 */
Ext.define('GeoExt.component.Popup', {
    requires: [],
    extend: 'Ext.Component',
    alias: [
        'widget.gx_popup',
        'widget.gx_component_popup'
    ],
    config: {
        /**
         *
         */
        overlay: null,
        /**
         *
         */
        map: null
    },
    /**
     * @private
     */
    overlayElement: null,
    /**
     * @private
     */
    overlayElementCreated: false,
    /**
     * The CSS class of the popup.
     */
    cls: 'gx-popup',
    /**
     * Construct a popup.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        var me = this;
        var cfg = config || {};
        var overlayElement;
        if (!Ext.isDefined(cfg.map)) {
            Ext.Error.raise('Required configuration \'map\' not passed');
        }
        if (Ext.isDefined(cfg.renderTo)) {
            // use the passed element/string
            overlayElement = Ext.get(cfg.renderTo).dom;
        } else {
            // create a div we can reference in
            // order to bind this div to an ol overlay
            overlayElement = Ext.dom.Helper.append(Ext.getBody(), '<div>');
            // keep track of the fact that we created the element, we should
            // also clean it up once we are being destroyed.
            me.overlayElementCreated = true;
        }
        cfg.renderTo = overlayElement;
        me.overlayElement = overlayElement;
        me.callParent([
            cfg
        ]);
    },
    /**
     * @private
     */
    initComponent: function() {
        var me = this;
        me.updateLayout = me.updateLayout.bind(me);
        me.on({
            afterrender: me.setOverlayElement,
            beforedestroy: me.onBeforeDestroy,
            scope: me
        });
        me.callParent();
        me.setupOverlay();
    },
    /**
     * @private
     */
    setupOverlay: function() {
        var me = this;
        var overlay = new ol.Overlay({
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            });
        me.getMap().addOverlay(overlay);
        // fix layout of popup when its position changes
        overlay.on('change:position', me.updateLayout);
        // make accessible as member
        me.setOverlay(overlay);
    },
    /**
     * @private
     */
    setOverlayElement: function() {
        // bind our containing div to the ol overlay
        this.getOverlay().set('element', this.overlayElement);
    },
    /**
     * (Re-)Positions the popup to the given coordinates.
     *
     * @param {ol.Coordinate} coordinate The new position of the popup as
     *     `ol.Coordinate`.
     */
    position: function(coordinate) {
        var me = this;
        me.getOverlay().setPosition(coordinate);
    },
    /**
     * @private
     */
    onBeforeDestroy: function() {
        var me = this;
        if (me.overlayElementCreated && me.overlayElement) {
            var parent = me.overlayElement.parentNode;
            parent.removeChild(me.overlayElement);
        }
        me.getOverlay().un('change:position', me.doLayout);
    }
});

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
 * A {@link GeoExt.data.model.print.Layout Layout} of a mapfish print service
 * has many layout attributes. You can create correct instances of this class
 * by using the GeoExt.data.MapfishPrintProvider.
 *
 * @class GeoExt.data.model.print.LayoutAttribute
 */
Ext.define('GeoExt.data.model.print.LayoutAttribute', {
    extend: 'GeoExt.data.model.Base',
    /**
     * @method getLayout
     * Returns the attribute parent layout model. May be null if
     * LayoutAttribute is instantiated directly.
     * @return {GeoExt.data.model.print.Layout} The attributes layout
     */
    fields: [
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'type',
            type: 'string'
        },
        {
            name: 'clientInfo',
            type: 'auto'
        },
        {
            name: 'layoutId',
            reference: {
                type: 'print.Layout',
                inverse: 'attributes'
            }
        }
    ]
});

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
 * A {@link GeoExt.data.model.print.Capability Capability} of a mapfish print
 * service has many layouts. You can create correct instances of this class by
 * using the GeoExt.data.MapfishPrintProvider.
 *
 * @class GeoExt.data.model.print.Layout
 */
Ext.define('GeoExt.data.model.print.Layout', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.print.LayoutAttribute'
    ],
    /**
     * @method getCapability
     * Returns the layouts parent print capabilities. May be null if Layout is
     * instantiated directly.
     * @return {GeoExt.data.model.print.Capability} The print capabilities
     */
    /**
     * @method attributes
     * Returns an Ext.data.Store of referenced
     * {@link GeoExt.data.model.print.LayoutAttribute}s.
     * @return {Ext.data.Store} The store
     */
    fields: [
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'capabilityId',
            reference: {
                type: 'print.Capability',
                inverse: 'layouts'
            }
        }
    ]
});

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
 * A data model that represents a `Capability` of a mapfish print service: It
 * can comfortably be generated by using an GeoExt.data.MapfishPrintProvider.
 *
 * @class GeoExt.data.model.print.Capability
 */
Ext.define('GeoExt.data.model.print.Capability', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.print.Layout'
    ],
    /**
     * @method layouts
     * Returns an Ext.data.Store of referenced
     * {@link GeoExt.data.model.print.Layout}s.
     * @return {Ext.data.Store} The store
     */
    fields: [
        {
            name: 'app',
            type: 'string'
        },
        {
            name: 'formats',
            type: 'auto',
            defaultValue: []
        }
    ]
});

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
 * Provides an interface to a Mapfish or GeoServer print module.
 *
 * @class GeoExt.data.MapfishPrintProvider
 */
Ext.define('GeoExt.data.MapfishPrintProvider', {
    extend: 'Ext.Base',
    mixins: [
        'Ext.mixin.Observable',
        'GeoExt.mixin.SymbolCheck'
    ],
    requires: [
        'GeoExt.data.model.print.Capability',
        'Ext.data.JsonStore',
        'Ext.data.Store',
        'Ext.data.proxy.Ajax',
        'Ext.data.proxy.JsonP'
    ],
    symbols: [
        'ol.Collection',
        'ol.geom.Polygon.fromExtent',
        'ol.Feature',
        'ol.layer.Layer#getSource',
        'ol.layer.Group',
        'ol.source.Vector.prototype.addFeature',
        'ol.View#calculateExtent'
    ],
    /**
     * @event ready
     * Fires after the PrintCapability store is loaded.
     *
     * @param {GeoExt.data.MapfishPrintProvider} provider The
     *     GeoExt.data.MapfishPrintProvider itself
     */
    config: {
        capabilities: null,
        url: '',
        useJsonp: true
    },
    inheritableStatics: {
        /**
         * An array of objects specifying a serializer and a connected
         * OpenLayers class. This should not be manipulated by hand, but rather
         * with the method #registerSerializer.
         *
         * @private
         */
        _serializers: [],
        /**
         * Registers the passed serializer class as an appropriate serializer
         * for the passed OpenLayers source class.
         *
         * @param {ol.source.Source} olSourceCls The OpenLayers source class
         *    that the passed serializer can serialize.
         * @param {GeoExt.data.serializer.Base} serializerCls The serializer
         *    that can serialize the passed source.
         */
        registerSerializer: function(olSourceCls, serializerCls) {
            var staticMe = GeoExt.data.MapfishPrintProvider;
            staticMe._serializers.push({
                olSourceCls: olSourceCls,
                serializerCls: serializerCls
            });
        },
        /**
         * Unregisters the passed serializer class from the array of available
         * serializers. This may be useful if you want to register a new
         * serializer that is different from a serializer that we provide.
         *
         * @param {GeoExt.data.serializer.Base} serializerCls The serializer
         *    that can serialize the passed source.
         * @return {Boolean} Whether we could unregister the serializer.
         */
        unregisterSerializer: function(serializerCls) {
            var available = GeoExt.data.MapfishPrintProvider._serializers;
            var index;
            Ext.each(available, function(candidate, idx) {
                if (candidate.serializerCls === serializerCls) {
                    index = idx;
                    return false;
                }
            });
            // break early
            if (Ext.isDefined(index)) {
                Ext.Array.removeAt(available, index);
                return true;
            }
            return false;
        },
        /**
         * Returns a GeoExt.data.serializer.Base capable of serializing the
         * passed source instance or undefined, if no such serializer was
         * previously registered.
         *
         * @param {ol.source.Source} source The source instance to find a
         *    serializer for.
         * @return {GeoExt.data.serializer.Base} A serializer for the passed
         *    source or `undefined`.
         */
        findSerializerBySource: function(source) {
            var available = GeoExt.data.MapfishPrintProvider._serializers;
            var serializer;
            Ext.each(available, function(candidate) {
                if (source instanceof candidate.olSourceCls) {
                    serializer = candidate.serializerCls;
                    return false;
                }
            });
            // break early
            if (!serializer) {
                Ext.log.warn('Couldn\'t find a suitable serializer for source.' + ' Did you require() an appropriate serializer class?');
            }
            return serializer;
        },
        /**
         * Will return an array of ol-layers by the given collection. Layers
         * contained in `ol.layer.Group`s get extracted and groups get removed
         * from returning array
         *
         * @param {GeoExt.data.store.Layers|ol.Collection|ol.layer.Base[]} coll
         *     The 'collection' of layers to get as array. If passed as
         *     ol.Collection, all items must be `ol.layer.Base`.
         * @return {Array} The flat layers array.
         */
        getLayerArray: function(coll) {
            var me = this;
            var inputLayers = [];
            var outputLayers = [];
            if (coll instanceof GeoExt.data.store.Layers) {
                coll.each(function(layerRec) {
                    var layer = layerRec.getOlLayer();
                    inputLayers.push(layer);
                });
            } else if (coll instanceof ol.Collection) {
                inputLayers = Ext.clone(coll.getArray());
            } else {
                inputLayers = Ext.clone(coll);
            }
            inputLayers.forEach(function(layer) {
                if (layer instanceof ol.layer.Group) {
                    Ext.each(me.getLayerArray(layer.getLayers()), function(subLayer) {
                        outputLayers.push(subLayer);
                    });
                } else {
                    outputLayers.push(layer);
                }
            });
            return outputLayers;
        },
        /**
         * Will return an array of serialized layers for mapfish print servlet
         * v3.0.
         *
         * @param {GeoExt.component.Map} mapComponent The GeoExt map component
         *     to get the the layers from.
         * @param {Function} [filterFn] A function to filter the layers to be
         *     serialized.
         * @param {ol.layer.Base} filterFn.item The layer to check for
         *     inclusion.
         * @param {Number} filterFn.index The index of the layer in the
         *     flattened list.
         * @param {Array} filterFn.array The complete flattened array of layers.
         * @param {Boolean} filterFn.return Return a truthy value to keep the
         *     layer and serialize it.
         * @param {Object} [filterScope] The scope in which the filtering
         *     function will be executed.
         * @return {Object[]} An array of serialized layers.
         * @static
         */
        getSerializedLayers: function(mapComponent, filterFn, filterScope) {
            var layers = mapComponent.getLayers();
            var viewRes = mapComponent.getView().getResolution();
            var serializedLayers = [];
            var inputLayers = this.getLayerArray(layers);
            if (Ext.isDefined(filterFn)) {
                inputLayers = Ext.Array.filter(inputLayers, filterFn, filterScope);
            }
            Ext.each(inputLayers, function(layer) {
                var source = layer.getSource();
                var serialized = {};
                var serializer = this.findSerializerBySource(source);
                if (serializer) {
                    serialized = serializer.serialize(layer, source, viewRes, mapComponent.map);
                    serializedLayers.push(serialized);
                }
            }, this);
            return serializedLayers;
        },
        /**
         * Renders the extent of the printout. Will ensure that the extent is
         * always visible and that the ratio matches the ratio that clientInfo
         * contains.
         *
         * @param {GeoExt.component.Map} mapComponent The map component to
         *     render the print extent to.
         * @param {ol.layer.Vector} extentLayer The vector layer to render the
         *     print extent to.
         * @param {Object} clientInfo Information about the desired print
         *     dimensions.
         * @param {Number} clientInfo.width The target width.
         * @param {Number} clientInfo.height The target height.
         * @return {ol.Feature} The feature representing the print extent.
         */
        renderPrintExtent: function(mapComponent, extentLayer, clientInfo) {
            var mapComponentWidth = mapComponent.getWidth();
            var mapComponentHeight = mapComponent.getHeight();
            var currentMapRatio = mapComponentWidth / mapComponentHeight;
            var scaleFactor = 0.6;
            var desiredPrintRatio = clientInfo.width / clientInfo.height;
            var targetWidth;
            var targetHeight;
            var geomExtent;
            var feat;
            if (desiredPrintRatio >= currentMapRatio) {
                targetWidth = mapComponentWidth * scaleFactor;
                targetHeight = targetWidth / desiredPrintRatio;
            } else {
                targetHeight = mapComponentHeight * scaleFactor;
                targetWidth = targetHeight * desiredPrintRatio;
            }
            geomExtent = mapComponent.getView().calculateExtent([
                targetWidth,
                targetHeight
            ]);
            feat = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent));
            extentLayer.getSource().addFeature(feat);
            return feat;
        }
    },
    /**
     * The capabiltyRec is an instance of 'GeoExt.data.model.print.Capability'
     * and contains the PrintCapabilities of the Printprovider.
     *
     * @property
     * @readonly
     */
    capabilityRec: null,
    constructor: function(cfg) {
        this.mixins.observable.constructor.call(this, cfg);
        if (!cfg.capabilities && !cfg.url) {
            Ext.Error.raise('Print capabilities or Url required');
        }
        this.initConfig(cfg);
        this.fillCapabilityRec();
    },
    /**
     * Creates the store from object or url.
     *
     * @private
     */
    fillCapabilityRec: function() {
        // enhance checks
        var store;
        var capabilities = this.getCapabilities();
        var url = this.getUrl();
        var fillRecordAndFireEvent = function() {
                this.capabilityRec = store.getAt(0);
                if (!this.capabilityRec) {
                    this.fireEvent('error', this);
                } else {
                    this.fireEvent('ready', this);
                }
            };
        if (capabilities) {
            // if capability object is passed
            store = Ext.create('Ext.data.JsonStore', {
                model: 'GeoExt.data.model.print.Capability',
                listeners: {
                    datachanged: fillRecordAndFireEvent,
                    scope: this
                }
            });
            store.loadRawData(capabilities);
        } else if (url) {
            // if servlet url is passed
            var proxy = {
                    url: url
                };
            if (this.getUseJsonp()) {
                proxy.type = 'jsonp';
                proxy.callbackKey = 'jsonp';
            } else {
                proxy.type = 'ajax';
                proxy.reader = {
                    type: 'json'
                };
            }
            store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                model: 'GeoExt.data.model.print.Capability',
                proxy: proxy,
                listeners: {
                    load: fillRecordAndFireEvent,
                    scope: this
                }
            });
        }
    }
});

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
 * Simple model that maps an ol.Object to an Ext.data.Model.
 *
 * @class GeoExt.data.model.OlObject
 */
Ext.define('GeoExt.data.model.OlObject', {
    extend: 'GeoExt.data.model.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol',
        'ol.Object',
        'ol.Object#on',
        'ol.Object#get',
        'ol.Object#set'
    ],
    inheritableStatics: {
        /**
         * Gets a reference to an ol constructor function.
         *
         * @param {String} str Description of the form `"ol.layer.Base"`.
         * @return {Function} the ol constructor.
         * @static
         */
        getOlCLassRef: function(str) {
            var ref = ol;
            var members;
            if (Ext.isString(str)) {
                members = str.split('.');
                // shift if description contains namespace
                if (Ext.Array.indexOf(members, 'ol') === 0) {
                    members.shift();
                }
                // traverse namespace to ref
                Ext.Array.each(members, function(member) {
                    ref = ref[member];
                });
            }
            return ref;
        }
    },
    /**
     * String description of the reference path to the wrapped ol class.
     *
     * @property {String}
     */
    olClass: 'ol.Object',
    /**
     * The underlying ol.Object.
     *
     * @property {ol.Object}
     */
    olObject: null,
    proxy: {
        type: 'memory',
        reader: 'json'
    },
    /**
     * @inheritdoc
     */
    constructor: function(data) {
        var me = this;
        var statics = this.statics();
        var OlClass = statics.getOlCLassRef(this.olClass);
        data = data || {};
        // init ol object if plain data is handed over
        if (!(data instanceof OlClass)) {
            data = new OlClass(data);
        }
        me.olObject = data;
        // init record with properties of underlying ol object
        me.callParent([
            this.olObject.getProperties()
        ]);
        me.onPropertychange = me.onPropertychange.bind(me);
        me.olObject.on('propertychange', me.onPropertychange);
    },
    /**
     * Listener to propertychange events of the underlying `ol.Object`. All
     * changes on the object will be forwarded to the Ext.data.Model.
     *
     * @param  {ol.ObjectEvent} evt The `ol.ObjectEvent` we receive as handler.
     * @private
     */
    onPropertychange: function(evt) {
        var target = evt.target;
        var key = evt.key;
        if (!this.__updating) {
            this.set(key, target.get(key));
        }
    },
    /**
     * Overridden to forward changes to the underlying `ol.Object`. All changes
     * on the `Ext.data.Model` properties will be set on the `ol.Object` as
     * well.
     *
     * @param {String|Object} key The key to set.
     * @param {Object} newValue The value to set.
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
        var o = {};
        this.callParent(arguments);
        // forward changes to ol object
        this.__updating = true;
        // wrap simple set operations into an object
        if (Ext.isString(key)) {
            o[key] = newValue;
        } else {
            o = key;
        }
        // iterate over object setting changes to ol.Object
        Ext.Object.each(o, function(k, v) {
            if (this.olObject.get(k) !== v) {
                this.olObject.set(k, v);
            }
        }, this);
        this.__updating = false;
    },
    /**
     * Overridden to unregister all added event listeners on the ol.Object.
     *
     * @inheritdoc
     */
    destroy: function() {
        this.olObject.un('propertychange', this.onPropertychange);
        this.callParent(arguments);
    }
});

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
 * Data model holding an OpenLayers feature (`ol.Feature`).
 *
 * @class GeoExt.data.model.Feature
 */
Ext.define('GeoExt.data.model.Feature', {
    extend: 'GeoExt.data.model.OlObject',
    /**
     * Returns the underlying `ol.Feature` of this record.
     *
     * @return {ol.Feature} The underlying `ol.Feature`.
     */
    getFeature: function() {
        return this.olObject;
    }
});

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
 * The layer tree node class used by the stores used in trees.
 *
 * @class GeoExt.data.model.LayerTreeNode
 */
Ext.define('GeoExt.data.model.LayerTreeNode', {
    extend: 'GeoExt.data.model.Layer',
    requires: [
        'Ext.data.NodeInterface'
    ],
    mixins: [
        'Ext.mixin.Queryable',
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.layer.Base',
        'ol.Object#get',
        'ol.Object#set'
    ],
    fields: [
        {
            name: 'leaf',
            type: 'boolean',
            convert: function(v, record) {
                var isGroup = record.get('isLayerGroup');
                if (isGroup === undefined || isGroup) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        {
            /**
         * This should be set via tree panel.
         */
            name: '__toggleMode',
            type: 'string',
            defaultValue: 'classic'
        },
        {
            name: 'iconCls',
            type: 'string',
            convert: function(v, record) {
                return record.getOlLayerProp('iconCls');
            }
        }
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    /**
     * @inheritDoc
     */
    constructor: function() {
        var layer;
        this.callParent(arguments);
        layer = this.getOlLayer();
        if (layer instanceof ol.layer.Base) {
            this.set('checked', layer.get('visible'));
            layer.on('change:visible', this.onLayerVisibleChange.bind(this));
        }
    },
    /**
     * Handler for the `change:visible` event of the layer.
     *
     * @param {ol.ObjectEvent} evt The emitted `ol.Object` event.
     */
    onLayerVisibleChange: function(evt) {
        var target = evt.target;
        if (!this.__updating) {
            this.set('checked', target.get('visible'));
        }
    },
    /**
     * Overridden to forward changes to the underlying `ol.Object`. All changes
     * on the {Ext.data.Model} properties will be set on the `ol.Object` as
     * well.
     *
     * @param {String} key The key to set.
     * @param {Object} newValue The value to set.
     *
     * @inheritdoc
     */
    set: function(key, newValue) {
        var me = this;
        var classicMode = (me.get('__toggleMode') === 'classic');
        me.callParent(arguments);
        // forward changes to ol object
        if (key === 'checked') {
            if (me.get('__toggleMode') === 'ol3') {
                me.getOlLayer().set('visible', newValue);
                return;
            }
            me.__updating = true;
            if (me.get('isLayerGroup') && classicMode) {
                me.getOlLayer().set('visible', newValue);
                if (me.childNodes) {
                    me.eachChild(function(child) {
                        child.getOlLayer().set('visible', newValue);
                    });
                }
            } else {
                me.getOlLayer().set('visible', newValue);
            }
            me.__updating = false;
            if (classicMode) {
                me.toggleParentNodes(newValue);
            }
        }
    },
    /**
     * Handles parent behaviour of checked nodes: Checks parent Nodes if node
     * is checked or unchecks parent nodes if the node is unchecked and no
     * sibling is checked.
     *
     * @param {Boolean} newValue The newValue to pass through to the parent.
     * @private
     */
    toggleParentNodes: function(newValue) {
        var me = this;
        // Checks parent Nodes if node is checked.
        if (newValue === true) {
            me.__updating = true;
            me.bubble(function(parent) {
                if (!parent.isRoot()) {
                    parent.set('__toggleMode', 'ol3');
                    // prevents recursion
                    parent.set('checked', true);
                    parent.set('__toggleMode', 'classic');
                }
            });
            me.__updating = false;
        }
        // Unchecks parent Nodes if the node is unchecked and no sibling is
        // checked.
        if (newValue === false) {
            me.__updating = true;
            me.bubble(function(parent) {
                if (!parent.isRoot()) {
                    var allUnchecked = true;
                    parent.eachChild(function(child) {
                        if (child.get('checked')) {
                            allUnchecked = false;
                        }
                    });
                    if (allUnchecked) {
                        parent.set('__toggleMode', 'ol3');
                        // prevents recursion
                        parent.set('checked', false);
                        parent.set('__toggleMode', 'classic');
                    }
                }
            });
            me.__updating = false;
        }
    },
    /**
     * @inheritdoc
     */
    getRefItems: function() {
        return this.childNodes;
    },
    /**
     * @inheritdoc
     */
    getRefOwner: function() {
        return this.parentNode;
    }
}, function() {
    // make this an Ext.data.TreeModel
    Ext.data.NodeInterface.decorate(this);
});

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
 * The base class for all serializers.
 *
 * @class GeoExt.data.serializer.Base
 */
Ext.define('GeoExt.data.serializer.Base', {
    extend: 'Ext.Base',
    requires: [
        'GeoExt.data.MapfishPrintProvider'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.layer.Layer',
        'ol.source.Source'
    ],
    inheritableStatics: {
        /**
         * The ol.source.Source class that this serializer will serialize.
         *
         * @type {ol.source.Source}
         * @protected
         */
        sourceCls: null,
        /**
         * Serializes the passed source and layer into an object that the
         * Mapfish Print Servlet understands.
         *
         * @param {ol.layer.Layer} layer The layer to serialize.
         * @param {ol.source.Source} source The source of the layer to
         *    serialize.
         * @param {Number} viewRes The resolution of the mapview.
         * @return {Object} A serialized representation of source and layer.
         */
        serialize: function() {
            Ext.raise('This method must be overridden by subclasses.');
            return null;
        },
        // so that we can have a shared JSDoc comment.
        /**
         * Given a subclass of GeoExt.data.serializer.Base, register the class
         * with the GeoExt.data.MapfishPrintProvider. This method is usually
         * called inside the 'after-create' function of `Ext.class` definitions.
         *
         * @param {GeoExt.data.serializer.Base} subCls The class to register.
         * @protected
         */
        register: function(subCls) {
            GeoExt.data.MapfishPrintProvider.registerSerializer(subCls.sourceCls, subCls);
        },
        /**
         * Given a concrete `ol.source.Source` instance, this method checks if
         * the non-abstract subclass is capable of serializing the source. Will
         * throw an exception if the source isn't valid for the serializer.
         *
         * @param {ol.source.Source} source The source to test.
         * @protected
         */
        validateSource: function(source) {
            if (!(source instanceof this.sourceCls)) {
                Ext.raise('Cannot serialize this source with this serializer');
            }
        }
    }
});

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
 * A serializer for layers that have an `ol.source.ImageWMS` source.
 *
 * @class GeoExt.data.serializer.ImageWMS
 */
Ext.define('GeoExt.data.serializer.ImageWMS', {
    extend: 'GeoExt.data.serializer.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.layer.Layer#getOpacity',
        'ol.source.ImageWMS',
        'ol.source.ImageWMS#getUrl',
        'ol.source.ImageWMS#getParams'
    ],
    inheritableStatics: {
        /**
         * @inheritdoc
         */
        sourceCls: ol.source.ImageWMS,
        /**
         * @inheritdoc
         */
        serialize: function(layer, source) {
            this.validateSource(source);
            var styles = source.getParams().STYLES;
            var stylesArray;
            if (Ext.isArray(styles)) {
                stylesArray = styles;
            } else {
                stylesArray = styles ? styles.split(',') : [
                    ''
                ];
            }
            var serialized = {
                    baseURL: source.getUrl(),
                    customParams: source.getParams(),
                    layers: [
                        source.getParams().LAYERS
                    ],
                    opacity: layer.getOpacity(),
                    styles: stylesArray,
                    type: 'WMS'
                };
            return serialized;
        }
    }
}, function(cls) {
    // Register this serializer via the inherited method `register`.
    cls.register(cls);
});

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
 * A serializer for layers that have an `ol.source.TileWMS` source.
 *
 * @class GeoExt.data.serializer.TileWMS
 */
Ext.define('GeoExt.data.serializer.TileWMS', {
    extend: 'GeoExt.data.serializer.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.layer.Layer#getOpacity',
        'ol.source.TileWMS',
        'ol.source.TileWMS#getUrls',
        'ol.source.TileWMS#getParams'
    ],
    inheritableStatics: {
        /**
         * @inheritdoc
         */
        sourceCls: ol.source.TileWMS,
        /**
         * @inheritdoc
         */
        serialize: function(layer, source) {
            this.validateSource(source);
            var styles = source.getParams().STYLES;
            var stylesArray;
            if (Ext.isArray(styles)) {
                stylesArray = styles;
            } else {
                stylesArray = styles ? styles.split(',') : [
                    ''
                ];
            }
            var serialized = {
                    baseURL: source.getUrls()[0],
                    customParams: source.getParams(),
                    layers: [
                        source.getParams().LAYERS
                    ],
                    opacity: layer.getOpacity(),
                    styles: stylesArray,
                    type: 'WMS'
                };
            return serialized;
        }
    }
}, function(cls) {
    // Register this serializer via the inherited method `register`.
    cls.register(cls);
});

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
 * A serializer for layers that have an `ol.source.Vector` source.
 *
 * This class is heavily inspired by the excellent `ngeo` Print service class:
 * [camptocamp/ngeo](https://github.com/camptocamp/ngeo).
 *
 * Additionally some utility methods were borrowed from the color class of the
 * [google/closure-library](https://github.com/google/closure-library).
 *
 * @class GeoExt.data.serializer.Vector
 */
Ext.define('GeoExt.data.serializer.Vector', {
    extend: 'GeoExt.data.serializer.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.color.asArray',
        'ol.Feature',
        'ol.Feature#getGeometry',
        'ol.Feature#getStyleFunction',
        'ol.format.GeoJSON',
        'ol.format.GeoJSON#writeFeatureObject',
        'ol.geom.Geometry',
        'ol.geom.LineString#getType',
        'ol.geom.MultiLineString#getType',
        'ol.geom.MultiPoint#getType',
        'ol.geom.MultiPolygon#getType',
        'ol.geom.Point#getType',
        'ol.geom.Polygon#getType',
        'ol.layer.Vector#getOpacity',
        'ol.layer.Vector#getStyleFunction',
        'ol.source.Vector',
        'ol.source.Vector#getFeatures',
        'ol.style.Circle',
        'ol.style.Circle#getRadius',
        'ol.style.Circle#getFill',
        'ol.style.Fill',
        'ol.style.Fill#getColor',
        'ol.style.Icon',
        'ol.style.Icon#getSrc',
        'ol.style.Icon#getRotation',
        'ol.style.Stroke',
        'ol.style.Stroke#getColor',
        'ol.style.Stroke#getWidth',
        'ol.style.Style',
        'ol.style.Style#getFill',
        'ol.style.Style#getImage',
        'ol.style.Style#getStroke',
        'ol.style.Style#getText',
        'ol.style.Text',
        'ol.style.Text#getFont',
        'ol.style.Text#getOffsetX',
        'ol.style.Text#getOffsetY',
        'ol.style.Text#getRotation',
        'ol.style.Text#getText',
        'ol.style.Text#getTextAlign'
    ],
    inheritableStatics: {
        /**
         * The types of styles that mapfish supports.
         *
         * @private
         */
        PRINTSTYLE_TYPES: {
            POINT: 'Point',
            LINE_STRING: 'LineString',
            POLYGON: 'Polygon'
        },
        /**
         * An object that maps an `ol.geom.GeometryType` to a #PRINTSTYLE_TYPES.
         *
         * @private
         */
        GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE: {},
        // filled once class is defined
        /**
         * A fallback serialization of a vector layer that will be used if
         * the given source e.g. doesn't have any features.
         *
         * @private
         */
        FALLBACK_SERIALIZATION: {
            geoJson: {
                type: 'FeatureCollection',
                features: []
            },
            opacity: 1,
            style: {
                'version': '2',
                '*': {
                    symbolizers: [
                        {
                            type: 'point',
                            strokeColor: 'white',
                            strokeOpacity: 1,
                            strokeWidth: 4,
                            strokeDashstyle: 'solid',
                            fillColor: 'red'
                        }
                    ]
                }
            },
            type: 'geojson'
        },
        /**
         * The prefix we will give to the generated styles. Every feature will
         * -- once it is serialized -- have a property constructed with
         * the #FEAT_STYLE_PREFIX and a counter. For every unique combination
         * of #FEAT_STYLE_PREFIX  + i with the value style uid (see #getUid
         * and #GX_UID_PROPERTY), the layer serialization will also have a
         * CQL entry with a matching symbolizer:
         *
         *     {
         *          // …
         *          style: {
         *              "[_gx3_style_0='ext-46']": {
         *                  symbolizer: {
         *                      // …
         *                  }
         *              }
         *          },
         *          geoJson: {
         *              // …
         *              features: [
         *                  {
         *                      // …
         *                      properties: {
         *                          '_gx3_style_0': 'ext-46'
         *                          // …
         *                      }
         *                  }
         *              ]
         *          }
         *          // …
         *     }
         *
         * @private
         */
        FEAT_STYLE_PREFIX: '_gx3_style_',
        /**
         * The name / identifier for the uid property that is assigned and read
         * out in #getUid
         *
         * @private
         */
        GX_UID_PROPERTY: '__gx_uid__',
        /**
         * A shareable instance of ol.format.GeoJSON to serialize the features.
         *
         * @private
         */
        format: new ol.format.GeoJSON(),
        /**
         * @inheritdoc
         */
        sourceCls: ol.source.Vector,
        /**
         * @inheritdoc
         */
        serialize: function(layer, source, viewRes, map) {
            var me = this;
            me.validateSource(source);
            var extent;
            if (map) {
                extent = map.getView().calculateExtent();
            }
            var format = me.format;
            var geoJsonFeatures = [];
            var mapfishStyleObject = {
                    version: 2
                };
            var processFeatures = function(feature) {
                    var geometry = feature.getGeometry();
                    if (Ext.isEmpty(geometry)) {
                        // no need to encode features with no geometry
                        return;
                    }
                    var geometryType = geometry.getType();
                    var geojsonFeature = format.writeFeatureObject(feature);
                    // remove parent feature references as they break serialization
                    // later on
                    if (geojsonFeature.properties && geojsonFeature.properties.parentFeature) {
                        geojsonFeature.properties.parentFeature = undefined;
                    }
                    var styles = null;
                    var styleFunction = feature.getStyleFunction();
                    if (Ext.isDefined(styleFunction)) {
                        styles = styleFunction(feature, viewRes);
                    } else {
                        styleFunction = layer.getStyleFunction();
                        if (Ext.isDefined(styleFunction)) {
                            styles = styleFunction(feature, viewRes);
                        }
                    }
                    if (!Ext.isArray(styles)) {
                        styles = [
                            styles
                        ];
                    }
                    if (!Ext.isEmpty(styles)) {
                        geoJsonFeatures.push(geojsonFeature);
                        if (Ext.isEmpty(geojsonFeature.properties)) {
                            geojsonFeature.properties = {};
                        }
                        Ext.each(styles, function(style, j) {
                            var styleId = me.getUid(style, geometryType);
                            var featureStyleProp = me.FEAT_STYLE_PREFIX + j;
                            me.encodeVectorStyle(mapfishStyleObject, geometryType, style, styleId, featureStyleProp);
                            geojsonFeature.properties[featureStyleProp] = styleId;
                        });
                    }
                };
            if (extent) {
                source.forEachFeatureInExtent(extent, processFeatures);
            } else {
                Ext.each(source.getFeatures(), processFeatures);
            }
            var serialized;
            // MapFish Print fails if there are no style rules, even if there
            // are no features either. To work around this, we add a basic
            // style in the else clause array of GeoJSON features is empty.
            if (geoJsonFeatures.length > 0) {
                var geojsonFeatureCollection = {
                        type: 'FeatureCollection',
                        features: geoJsonFeatures
                    };
                serialized = {
                    geoJson: geojsonFeatureCollection,
                    opacity: layer.getOpacity(),
                    style: mapfishStyleObject,
                    type: 'geojson'
                };
            } else {
                serialized = this.FALLBACK_SERIALIZATION;
            }
            return serialized;
        },
        /**
         * Encodes an ol.style.Style into the passed MapFish style object.
         *
         * @param {Object} object The MapFish style object.
         * @param {ol.geom.GeometryType} geometryType The type of the GeoJSON
         *    geometry
         * @param {ol.style.Style} style The style to encode.
         * @param {String} styleId The id of the style.
         * @param {String} featureStyleProp Feature style property name.
         * @private
         */
        encodeVectorStyle: function(object, geometryType, style, styleId, featureStyleProp) {
            var me = this;
            var printTypes = me.PRINTSTYLE_TYPES;
            var printStyleLookup = me.GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE;
            if (!Ext.isDefined(printStyleLookup[geometryType])) {
                // unsupported geometry type
                return;
            }
            var styleType = printStyleLookup[geometryType];
            var key = '[' + featureStyleProp + ' = \'' + styleId + '\']';
            if (Ext.isDefined(object[key])) {
                // do nothing if we already have a style object for this CQL
                // rule
                return;
            }
            var styleObject = {
                    symbolizers: []
                };
            object[key] = styleObject;
            var fillStyle = style.getFill();
            var imageStyle = style.getImage();
            var strokeStyle = style.getStroke();
            var textStyle = style.getText();
            var hasFillStyle = !Ext.isEmpty(fillStyle);
            var hasImageStyle = !Ext.isEmpty(imageStyle);
            var hasStrokeStyle = !Ext.isEmpty(strokeStyle);
            var hasTextStyle = !Ext.isEmpty(textStyle);
            var POLYTYPE = printTypes.POLYGON;
            var LINETYPE = printTypes.LINE_STRING;
            var POINTTYPE = printTypes.POINT;
            if (styleType === POLYTYPE && hasFillStyle) {
                me.encodeVectorStylePolygon(styleObject.symbolizers, fillStyle, strokeStyle);
            } else if (styleType === LINETYPE && hasStrokeStyle) {
                me.encodeVectorStyleLine(styleObject.symbolizers, strokeStyle);
            } else if (styleType === POINTTYPE && hasImageStyle) {
                me.encodeVectorStylePoint(styleObject.symbolizers, imageStyle);
            }
            // this can be there regardless of type
            if (hasTextStyle) {
                me.encodeTextStyle(styleObject.symbolizers, textStyle);
            }
        },
        /**
         * Encodes an `ol.style.Fill` and an optional `ol.style.Stroke` and adds
         * it to the passed symbolizers array.
         *
         * @param {Object[]} symbolizers Array of MapFish Print symbolizers.
         * @param {ol.style.Fill} fillStyle Fill style.
         * @param {ol.style.Stroke} strokeStyle Stroke style. May be null.
         * @private
         */
        encodeVectorStylePolygon: function(symbolizers, fillStyle, strokeStyle) {
            var symbolizer = {
                    type: 'polygon'
                };
            this.encodeVectorStyleFill(symbolizer, fillStyle);
            if (strokeStyle !== null) {
                this.encodeVectorStyleStroke(symbolizer, strokeStyle);
            }
            symbolizers.push(symbolizer);
        },
        /**
         * Encodes an `ol.style.Stroke` and adds it to the passed symbolizers
         * array.
         *
         * @param {Object[]} symbolizers Array of MapFish Print symbolizers.
         * @param {ol.style.Stroke} strokeStyle Stroke style.
         * @private
         */
        encodeVectorStyleLine: function(symbolizers, strokeStyle) {
            var symbolizer = {
                    type: 'line'
                };
            this.encodeVectorStyleStroke(symbolizer, strokeStyle);
            symbolizers.push(symbolizer);
        },
        /**
         * Encodes an `ol.style.Image` and adds it to the passed symbolizers
         * array.
         *
         * @param {Object[]} symbolizers Array of MapFish Print symbolizers.
         * @param {ol.style.Image} imageStyle Image style.
         * @private
         */
        encodeVectorStylePoint: function(symbolizers, imageStyle) {
            var symbolizer;
            if (imageStyle instanceof ol.style.Circle) {
                symbolizer = {
                    type: 'point'
                };
                symbolizer.pointRadius = imageStyle.getRadius();
                var fillStyle = imageStyle.getFill();
                if (fillStyle !== null) {
                    this.encodeVectorStyleFill(symbolizer, fillStyle);
                }
                var strokeStyle = imageStyle.getStroke();
                if (strokeStyle !== null) {
                    this.encodeVectorStyleStroke(symbolizer, strokeStyle);
                }
            } else if (imageStyle instanceof ol.style.Icon) {
                var src = imageStyle.getSrc();
                if (Ext.isDefined(src)) {
                    var img = imageStyle.getImage();
                    var canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    var format = 'image/' + src.match(/\.(\w+)$/)[1];
                    symbolizer = {
                        type: 'point',
                        externalGraphic: canvas.toDataURL(),
                        graphicFormat: format
                    };
                    var rotation = imageStyle.getRotation();
                    if (rotation !== 0) {
                        var degreesRotation = rotation * 180 / Math.PI;
                        symbolizer.rotation = degreesRotation;
                    }
                }
            }
            if (Ext.isDefined(symbolizer)) {
                symbolizers.push(symbolizer);
            }
        },
        /**
         * Encodes an `ol.style.Text` and adds it to the passed symbolizers
         * array.
         *
         * @param {Object[]} symbolizers Array of MapFish Print symbolizers.
         * @param {ol.style.Text} textStyle Text style.
         * @private
         */
        encodeTextStyle: function(symbolizers, textStyle) {
            var symbolizer = {
                    type: 'Text'
                };
            var label = textStyle.getText();
            if (!Ext.isDefined(label)) {
                // do not encode undefined labels
                return;
            }
            symbolizer.label = label;
            var labelAlign = textStyle.getTextAlign();
            if (Ext.isDefined(labelAlign)) {
                symbolizer.labelAlign = labelAlign;
            }
            var labelRotation = textStyle.getRotation();
            if (Ext.isDefined(labelRotation)) {
                // Mapfish Print expects a string to rotate text
                var strRotationDeg = (labelRotation * 180 / Math.PI) + '';
                symbolizer.labelRotation = strRotationDeg;
            }
            var offsetX = textStyle.getOffsetX();
            var offsetY = textStyle.getOffsetY();
            if (offsetX) {
                symbolizer.labelXOffset = offsetX;
            }
            if (offsetY) {
                symbolizer.labelYOffset = -offsetY;
            }
            var fontStyle = textStyle.getFont();
            if (Ext.isDefined(fontStyle)) {
                var font = fontStyle.split(' ');
                if (font.length >= 3) {
                    symbolizer.fontWeight = font[0];
                    symbolizer.fontSize = font[1];
                    symbolizer.fontFamily = font.splice(2).join(' ');
                }
            }
            var strokeStyle = textStyle.getStroke();
            if (strokeStyle !== null) {
                var strokeColor = strokeStyle.getColor();
                var strokeColorRgba = ol.color.asArray(strokeColor);
                symbolizer.haloColor = this.rgbArrayToHex(strokeColorRgba);
                symbolizer.haloOpacity = strokeColorRgba[3];
                var width = strokeStyle.getWidth();
                if (Ext.isDefined(width)) {
                    symbolizer.haloRadius = width;
                }
            }
            var fillStyle = textStyle.getFill();
            if (fillStyle !== null) {
                var fillColorRgba = ol.color.asArray(fillStyle.getColor());
                symbolizer.fontColor = this.rgbArrayToHex(fillColorRgba);
            }
            // Mapfish Print allows offset only if labelAlign is defined.
            if (Ext.isDefined(symbolizer.labelAlign)) {
                symbolizer.labelXOffset = textStyle.getOffsetX();
                // Mapfish uses the opposite direction of OpenLayers for y
                // axis, so the minus sign is required for the y offset to
                // be identical.
                symbolizer.labelYOffset = -textStyle.getOffsetY();
            }
            symbolizers.push(symbolizer);
        },
        /**
         * Encode the passed `ol.style.Fill` into the passed symbolizer.
         *
         * @param {Object} symbolizer MapFish Print symbolizer.
         * @param {ol.style.Fill} fillStyle Fill style.
         * @private
         */
        encodeVectorStyleFill: function(symbolizer, fillStyle) {
            var fillColor = fillStyle.getColor();
            if (fillColor !== null) {
                var fillColorRgba = ol.color.asArray(fillColor);
                symbolizer.fillColor = this.rgbArrayToHex(fillColorRgba);
                symbolizer.fillOpacity = fillColorRgba[3];
            }
        },
        /**
         * Encode the passed `ol.style.Stroke` into the passed symbolizer.
         *
         * @param {Object} symbolizer MapFish Print symbolizer.
         * @param {ol.style.Stroke} strokeStyle Stroke style.
         * @private
         */
        encodeVectorStyleStroke: function(symbolizer, strokeStyle) {
            var strokeColor = strokeStyle.getColor();
            if (strokeColor !== null) {
                var strokeColorRgba = ol.color.asArray(strokeColor);
                symbolizer.strokeColor = this.rgbArrayToHex(strokeColorRgba);
                symbolizer.strokeOpacity = strokeColorRgba[3];
            }
            var strokeWidth = strokeStyle.getWidth();
            if (Ext.isDefined(strokeWidth)) {
                symbolizer.strokeWidth = strokeWidth;
            }
        },
        /**
         * Takes a hex value and prepends a zero if it's a single digit.
         * Taken from https://github.com/google/closure-library color.js-file.
         * It is called `prependZeroIfNecessaryHelper` there.
         *
         * @param {String} hex Hex value to prepend if single digit.
         * @return {String} The hex value prepended with zero if it was single
         *     digit, otherwise the same value that was passed in.
         * @private
         */
        padHexValue: function(hex) {
            return hex.length === 1 ? '0' + hex : hex;
        },
        /**
         * Converts a color from RGB to hex representation.
         * Taken from https://github.com/google/closure-library color.js-file.
         *
         * @param {Number} r Amount of red, int between 0 and 255.
         * @param {Number} g Amount of green, int between 0 and 255.
         * @param {Number} b Amount of blue, int between 0 and 255.
         * @return {String} The passed color in hex representation.
         * @private
         */
        rgbToHex: function(r, g, b) {
            r = Number(r);
            g = Number(g);
            b = Number(b);
            if (isNaN(r) || r < 0 || r > 255 || isNaN(g) || g < 0 || g > 255 || isNaN(b) || b < 0 || b > 255) {
                Ext.raise('"(' + r + ',' + g + ',' + b + '") is not a valid ' + ' RGB color');
            }
            var hexR = this.padHexValue(r.toString(16));
            var hexG = this.padHexValue(g.toString(16));
            var hexB = this.padHexValue(b.toString(16));
            return '#' + hexR + hexG + hexB;
        },
        /**
         * Converts a color from RGB to hex representation.
         * Taken from https://github.com/google/closure-library color.js-file
         *
         * @param {Number[]} rgbArr An array with three numbers representing
         *    red, green and blue.
         * @return {String} The passed color in hex representation.
         * @private
         */
        rgbArrayToHex: function(rgbArr) {
            return this.rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]);
        },
        /**
         * Returns a unique id for this object. The object is assigned a new
         * property #GX_UID_PROPERTY and modified in place if this hasn't
         * happened in a previous call.
         *
         * @param {Object} obj The object to get the uid of.
         * @param {String} geometryType The geometryType for the style.
         * @return {String} The uid of the object.
         * @private
         */
        getUid: function(obj, geometryType) {
            if (!Ext.isObject(obj)) {
                Ext.raise('Cannot get uid of non-object.');
            }
            var key = this.GX_UID_PROPERTY;
            if (geometryType) {
                key += '-' + geometryType;
            }
            if (!Ext.isDefined(obj[key])) {
                obj[key] = Ext.id();
            }
            return obj[key];
        }
    }
}, function(cls) {
    // This is ol.geom.GeometryType, from
    // https://github.com/openlayers/ol3/blob/master/src/ol/geom/geometry.js
    var olGeomTypes = {
            POINT: 'Point',
            LINE_STRING: 'LineString',
            LINEAR_RING: 'LinearRing',
            POLYGON: 'Polygon',
            MULTI_POINT: 'MultiPoint',
            MULTI_LINE_STRING: 'MultiLineString',
            MULTI_POLYGON: 'MultiPolygon',
            GEOMETRY_COLLECTION: 'GeometryCollection',
            CIRCLE: 'Circle'
        };
    // The supported types for the print
    var printStyleTypes = cls.PRINTSTYLE_TYPES;
    // a map that connect ol geometry types to their mapfish equivalent;
    // Please note that not all ol geometry types can be serialized.
    var geom2print = {};
    geom2print[olGeomTypes.POINT] = printStyleTypes.POINT;
    geom2print[olGeomTypes.MULTI_POINT] = printStyleTypes.POINT;
    geom2print[olGeomTypes.LINE_STRING] = printStyleTypes.LINE_STRING;
    geom2print[olGeomTypes.MULTI_LINE_STRING] = printStyleTypes.LINE_STRING;
    geom2print[olGeomTypes.POLYGON] = printStyleTypes.POLYGON;
    geom2print[olGeomTypes.MULTI_POLYGON] = printStyleTypes.POLYGON;
    cls.GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE = geom2print;
    // Register this serializer via the inherited method `register`.
    cls.register(cls);
});

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
 * A serializer for layers that have an `ol.source.WMTS` source.
 *
 * This class is heavily inspired by the excellent `ngeo` Print service class:
 * [camptocamp/ngeo](https://github.com/camptocamp/ngeo).
 *
 * @class GeoExt.data.serializer.WMTS
 */
Ext.define('GeoExt.data.serializer.WMTS', {
    extend: 'GeoExt.data.serializer.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.proj.Projection#getMetersPerUnit',
        'ol.size.toSize',
        'ol.source.WMTS',
        'ol.source.WMTS#getDimensions',
        'ol.source.WMTS#getFormat',
        'ol.source.WMTS#getLayer',
        'ol.source.WMTS#getMatrixSet',
        'ol.source.WMTS#getProjection',
        'ol.source.WMTS#getRequestEncoding',
        'ol.source.WMTS#getStyle',
        'ol.source.WMTS#getTileGrid',
        'ol.source.WMTS#getUrls',
        'ol.source.WMTS#getVersion',
        'ol.tilegrid.WMTS#getMatrixIds',
        'ol.tilegrid.WMTS#getOrigin',
        'ol.tilegrid.WMTS#getResolution'
    ],
    inheritableStatics: {
        /**
         * @inheritdoc
         */
        sourceCls: ol.source.WMTS,
        /**
         * @inheritdoc
         */
        serialize: function(layer, source) {
            this.validateSource(source);
            var projection = source.getProjection();
            var tileGrid = source.getTileGrid();
            var dimensions = source.getDimensions();
            var dimensionKeys = Ext.Object.getKeys(dimensions);
            var matrixIds = tileGrid.getMatrixIds();
            var matrices = [];
            Ext.each(matrixIds, function(matrix, idx) {
                var sqrZ = Math.pow(2, idx);
                matrices.push({
                    identifier: matrix,
                    scaleDenominator: tileGrid.getResolution(idx) * projection.getMetersPerUnit() / 2.8E-4,
                    tileSize: ol.size.toSize(tileGrid.getTileSize(idx)),
                    topLeftCorner: tileGrid.getOrigin(idx),
                    matrixSize: [
                        sqrZ,
                        sqrZ
                    ]
                });
            });
            var serialized = {
                    baseURL: source.getUrls()[0],
                    dimensions: dimensionKeys,
                    dimensionParams: dimensions,
                    imageFormat: source.getFormat(),
                    layer: source.getLayer(),
                    matrices: matrices,
                    matrixSet: source.getMatrixSet(),
                    opacity: layer.getOpacity(),
                    requestEncoding: source.getRequestEncoding(),
                    style: source.getStyle(),
                    type: 'WMTS',
                    version: source.getVersion()
                };
            return serialized;
        }
    }
}, function(cls) {
    // Register this serializer via the inherited method `register`.
    cls.register(cls);
});

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
 * A serializer for layers that have an `ol.source.XYZ` source.
 * Sources with an tileUrlFunction are currently not supported.
 *
 * @class GeoExt.data.serializer.XYZ
 */
Ext.define('GeoExt.data.serializer.XYZ', {
    extend: 'GeoExt.data.serializer.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.layer.Base#getOpacity',
        'ol.size.toSize',
        'ol.source.XYZ',
        'ol.source.XYZ#getTileGrid',
        'ol.source.XYZ#getUrls',
        'ol.tilegrid.TileGrid#getResolutions',
        'ol.tilegrid.TileGrid#getTileSize'
    ],
    inheritableStatics: {
        /**
         *
         */
        allowedImageExtensions: [
            'png',
            'jpg',
            'gif'
        ],
        /**
         * @inheritdoc
         */
        sourceCls: ol.source.XYZ,
        /**
         * @inheritdoc
         */
        validateSource: function(source) {
            if (!(source instanceof this.sourceCls)) {
                Ext.raise('Cannot serialize this source with this serializer');
            }
            if (source.getUrls() === null) {
                Ext.raise('Cannot serialize this source without an URL. ' + 'Usage of tileUrlFunction is not yet supported');
            }
        },
        /**
         * @inheritdoc
         */
        serialize: function(layer, source) {
            this.validateSource(source);
            var tileGrid = source.getTileGrid();
            var serialized = {
                    baseURL: source.getUrls()[0],
                    opacity: layer.getOpacity(),
                    imageExtension: this.getImageExtensionFromSource(source) || 'png',
                    resolutions: tileGrid.getResolutions(),
                    tileSize: ol.size.toSize(tileGrid.getTileSize()),
                    type: 'OSM'
                };
            return serialized;
        },
        /**
         * Returns the file extension from the url and compares it to whitelist.
         * Sources with an tileUrlFunction are currently not supported.
         *
         * @private
         * @param {ol.source.XYZ} source An ol.source.XYZ.
         * @return {String} The fileExtension or `false` if none is found.
         */
        getImageExtensionFromSource: function(source) {
            var urls = source.getUrls();
            var url = urls ? urls[0] : '';
            var extension = url.substr(url.length - 3);
            if (Ext.isDefined(url) && Ext.Array.contains(this.allowedImageExtensions, extension)) {
                return extension;
            } else {
                Ext.raise('No url(s) supplied for ', source);
                return false;
            }
        }
    }
}, function(cls) {
    // Register this serializer via the inherited method `register`.
    cls.register(cls);
});

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
 * Simple store that maps a ol.Collection to a Ext.data.Store.
 *
 * @class GeoExt.data.store.OlObjects
 */
Ext.define('GeoExt.data.store.OlObjects', {
    extend: 'Ext.data.Store',
    requires: [
        'GeoExt.data.model.OlObject'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.Collection',
        'ol.Collection#getArray',
        'ol.Collection#insertAt',
        'ol.Collection#removeAt'
    ],
    /**
     * The ol collection this store syncs with.
     *
     * @property {ol.Collection}
     */
    olCollection: null,
    model: 'GeoExt.data.model.OlObject',
    proxy: {
        type: 'memory',
        reader: 'json'
    },
    listeners: {
        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @private
         * @inheritdoc
         */
        add: function(store, records, index) {
            var coll = store.olCollection;
            var length = records.length;
            var i;
            store.__updating = true;
            for (i = 0; i < length; i++) {
                if (!Ext.Array.contains(store.olCollection.getArray(), records[i].olObject)) {
                    coll.insertAt(index + i, records[i].olObject);
                }
            }
            store.__updating = false;
        },
        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @private
         * @inheritdoc
         */
        remove: function(store, records, index) {
            var coll = store.olCollection;
            store.__updating = true;
            Ext.each(records, function(rec) {
                coll.remove(rec.olObject);
            });
            store.__updating = false;
        }
    },
    /**
     * Constructs a new OlObjects store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        config = config || {};
        // cache ol.Collection on property
        if (config.data instanceof ol.Collection) {
            this.olCollection = config.data;
        } else // init ol.Collection if array is provided
        {
            this.olCollection = new ol.Collection(config.data || []);
        }
        delete config.data;
        config.data = this.olCollection.getArray();
        this.callParent([
            config
        ]);
    },
    /**
     * @inheritdoc
     */
    destroy: function() {
        delete this.olCollection;
        this.callParent(arguments);
    }
});

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
 * A data store holding OpenLayers feature objects (`ol.Feature`).
 *
 * @class GeoExt.data.store.Features
 */
Ext.define('GeoExt.data.store.Features', {
    extend: 'GeoExt.data.store.OlObjects',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.Collection',
        'ol.layer.Vector',
        'ol.Map',
        'ol.Map#addLayer',
        'ol.Map#removeLayer',
        'ol.source.Vector',
        'ol.source.Vector#getFeatures',
        'ol.source.Vector#on',
        'ol.source.Vector#un',
        'ol.style.Circle',
        'ol.style.Fill',
        'ol.style.Stroke',
        'ol.style.Style'
    ],
    model: 'GeoExt.data.model.Feature',
    config: {
        /**
         * Initial layer holding features which will be added to the store.
         *
         * The layer object which is in sync with this store.
         *
         * The layer needs to be constructed with an ol.source.Vector that
         * has an ol.Collection (constructor option `features` was set to
         * an ol.Collection).
         *
         * @property {ol.layer.Vector}
         * @readonly
         */
        layer: null
    },
    /**
     * A map object to which a possible #layer will be added.
     *
     * @cfg {ol.Map}
     */
    map: null,
    /**
     * Setting this flag to `true` will create a vector #layer with the
     * given #features and adds it to the given #map (if available).
     *
     * @cfg {Boolean}
     */
    createLayer: false,
    /**
     * Shows if the #layer has been created by constructor.
     *
     * @private
     * @property {Boolean}
     */
    layerCreated: false,
    /**
     * An OpenLayers 3 style object to style the vector #layer representing
     * the features of this store.
     *
     * @cfg {ol.Style}
     */
    style: null,
    /**
     * Initial set of features. Has to be an `ol.Collection` object with
     * `ol.Feature` objects in it.
     *
     * @cfg {ol.Collection}
     */
    features: null,
    /**
     * Setting this flag to true the filter of the store will be
     * applied to the underlying vector #layer.
     * This will only have an effect if the source of the #layer is NOT
     * configured with an 'url' parameter.
     *
     * @cfg {Boolean}
     */
    passThroughFilter: false,
    /**
     * Constructs the feature store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        var me = this;
        me.onOlCollectionAdd = me.onOlCollectionAdd.bind(me);
        me.onOlCollectionRemove = me.onOlCollectionRemove.bind(me);
        var cfg = config || {};
        if (me.style === null) {
            me.style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({
                        color: '#3399CC'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2
                    })
                })
            });
        }
        if (cfg.features !== undefined && cfg.layer !== undefined) {
            throw new Error('GeoExt.data.store.Features should only be' + ' configured with one or less of `features` and `layer`.');
        }
        var configErrorMessage = 'GeoExt.data.store.Features needs to be' + ' configured with a feature collection or with a layer with a' + ' source with a feature collection.';
        if (cfg.features === undefined && cfg.layer === undefined) {
            cfg.data = new ol.Collection();
        } else if (cfg.features !== undefined) {
            if (!(cfg.features instanceof ol.Collection)) {
                throw new Error('Features are not a collection. ' + configErrorMessage);
            }
            cfg.data = cfg.features;
        } else {
            if (!(cfg.layer instanceof ol.layer.Vector)) {
                throw new Error('Layer is no vector layer. ' + configErrorMessage);
            }
            if (!cfg.layer.getSource()) {
                throw new Error('Layer has no source. ' + configErrorMessage);
            }
            var features = cfg.layer.getSource().getFeaturesCollection();
            if (!features) {
                throw new Error('Source has no collection. ' + configErrorMessage);
            }
            cfg.data = features;
        }
        me.callParent([
            cfg
        ]);
        // create a vector layer and add to map if configured accordingly
        if (me.createLayer === true && !me.layer) {
            me.drawFeaturesOnMap();
        }
        this.olCollection.on('add', this.onOlCollectionAdd);
        this.olCollection.on('remove', this.onOlCollectionRemove);
        if (me.passThroughFilter === true) {
            me.on('filterchange', me.onFilterChange);
        }
    },
    /**
     * Forwards changes to the `ol.Collection` to the Ext.data.Store.
     *
     * @param {ol.CollectionEvent} evt The event emitted by the `ol.Collection`.
     * @private
     */
    onOlCollectionAdd: function(evt) {
        var target = evt.target;
        var element = evt.element;
        var idx = Ext.Array.indexOf(target.getArray(), element);
        if (!this.__updating) {
            this.insert(idx, element);
        }
    },
    /**
     * Forwards changes to the `ol.Collection` to the Ext.data.Store.
     *
     * @param {ol.CollectionEvent} evt The event emitted by the `ol.Collection`.
     * @private
     */
    onOlCollectionRemove: function(evt) {
        var element = evt.element;
        var idx = this.findBy(function(rec) {
                return rec.olObject === element;
            });
        if (idx !== -1) {
            if (!this.__updating) {
                this.removeAt(idx);
            }
        }
    },
    applyFields: function(fields) {
        var me = this;
        if (fields) {
            this.setModel(Ext.data.schema.Schema.lookupEntity(me.config.model));
        }
    },
    /**
     * Returns the FeatureCollection which is in sync with this store.
     *
     * @return {ol.Collection} The underlying OpenLayers `ol.Collection` of
     *     `ol.Feature`.
     */
    getFeatures: function() {
        return this.olCollection;
    },
    /**
     * Returns the record corresponding to a feature.
     *
     * @param {ol.Feature} feature An ol.Feature object to get the record for
     * @return {Ext.data.Model} The model instance corresponding to the feature
     */
    getByFeature: function(feature) {
        return this.getAt(this.findBy(function(record) {
            return record.getFeature() === feature;
        }));
    },
    /**
     * Overwrites the destroy function to ensure the #layer is removed from
     * the #map when it has been created automatically while construction in
     * case of destruction of this store.
     *
     * @protected
     */
    destroy: function() {
        this.olCollection.un('add', this.onCollectionAdd);
        this.olCollection.un('remove', this.onCollectionRemove);
        var me = this;
        if (me.map && me.layerCreated === true) {
            me.map.removeLayer(me.layer);
        }
        me.callParent(arguments);
    },
    /**
     * Draws the given #features on the #map.
     *
     * @private
     */
    drawFeaturesOnMap: function() {
        var me = this;
        // create a layer representation of our features
        me.source = new ol.source.Vector({
            features: me.getFeatures()
        });
        me.layer = new ol.layer.Vector({
            source: me.source,
            style: me.style
        });
        // add layer to connected map, if available
        if (me.map) {
            me.map.addLayer(me.layer);
        }
        me.layerCreated = true;
    },
    /**
     * Handles the 'filterchange'-event.
     * Applies the filter of this store to the underlying layer.
     * @private
     */
    onFilterChange: function() {
        var me = this;
        if (me.layer && me.layer.getSource() instanceof ol.source.Vector) {
            if (!me.__updating) {
                me.__updating = true;
                me.olCollection.clear();
                // add the filtered features to the collection
                me.each(function(rec) {
                    me.olCollection.push(rec.getFeature());
                });
                delete me.__updating;
            }
        }
    }
});

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
 * A store that is synchronized with a GeoExt.data.store.Layers. It can be
 * used by an {Ext.tree.Panel}.
 *
 * @class GeoExt.data.store.LayersTree
 */
Ext.define('GeoExt.data.store.LayersTree', {
    extend: 'Ext.data.TreeStore',
    alternateClassName: [
        'GeoExt.data.TreeStore'
    ],
    requires: [
        'GeoExt.util.Layer'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.Collection',
        'ol.Collection#getArray',
        'ol.Collection#once',
        'ol.Collection#un',
        'ol.layer.Base',
        'ol.layer.Base#get',
        'ol.layer.Group',
        'ol.layer.Group#get',
        'ol.layer.Group#getLayers'
    ],
    model: 'GeoExt.data.model.LayerTreeNode',
    config: {
        /**
         * The ol.layer.Group that the tree is derived from.
         *
         * @cfg {ol.layer.Group}
         */
        layerGroup: null,
        /**
         * Configures the behaviour of the checkbox of an `ol.layer.Group`
         * (folder). Possible values are `'classic'` or `'ol3'`.
         *
         * * `'classic'` forwards the checkstate to the children of the folder.
         *   * Check a leaf => all parent nodes are checked
         *   * Uncheck all leafs in a folder => parent node is unchecked
         *   * Check a folder Node => all children are checked
         *   * Uncheck a folder Node => all children are unchecked
         * * `'ol3'` emulates the behaviour of `ol.layer.Group`. So a layerGroup
         *   can be invisible but can have visible children.
         *   * Emulates the behaviour of an `ol.layer.Group,` so a parentfolder
         *     can be unchecked but still contain checked leafs and vice versa.
         *
         * @cfg
         */
        folderToggleMode: 'classic'
    },
    statics: {
        /**
         * A string which we'll us for child nodes to detect if they are removed
         * because their parent collapsed just recently. See the private
         * method #onBeforeGroupNodeToggle for an explanation.
         *
         * @private
         */
        KEY_COLLAPSE_REMOVE_OPT_OUT: '__remove_by_collapse__'
    },
    /**
     * Defines if the order of the layers added to the store will be
     * reversed. The default behaviour and what most users expect is
     * that mapLayers on top are also on top in the tree.
     *
     * @property {Boolean}
     */
    inverseLayerOrder: true,
    /**
     * Whether the treestore currently shall handle openlayers collection
     * change events. See #suspendCollectionEvents and #resumeCollectionEvents.
     *
     * @property
     * @private
     */
    collectionEventsSuspended: false,
    /**
     * @cfg
     * @inheritdoc Ext.data.TreeStore
     */
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    root: {
        expanded: true
    },
    /**
     * Constructs a LayersTree store.
     */
    constructor: function() {
        var me = this;
        me.onLayerCollectionRemove = me.onLayerCollectionRemove.bind(me);
        me.onLayerCollectionAdd = me.onLayerCollectionAdd.bind(me);
        me.bindGroupLayerCollectionEvents = me.bindGroupLayerCollectionEvents.bind(me);
        me.unbindGroupLayerCollectionEvents = me.unbindGroupLayerCollectionEvents.bind(me);
        me.callParent(arguments);
        var collection = me.layerGroup.getLayers();
        Ext.each(collection.getArray(), function(layer) {
            me.addLayerNode(layer);
        }, me, me.inverseLayerOrder);
        me.bindGroupLayerCollectionEvents(me.layerGroup);
        me.on({
            remove: me.handleRemove,
            noderemove: me.handleNodeRemove,
            nodeappend: me.handleNodeAppend,
            nodeinsert: me.handleNodeInsert,
            scope: me
        });
    },
    /**
     * Applies the #folderToggleMode to the treenodes.
     *
     * @param {String} folderToggleMode The folderToggleMode that was set.
     * @return {String} The folderToggleMode that was set.
     * @private
     */
    applyFolderToggleMode: function(folderToggleMode) {
        if (folderToggleMode === 'classic' || folderToggleMode === 'ol3') {
            var rootNode = this.getRootNode();
            if (rootNode) {
                rootNode.cascadeBy({
                    before: function(child) {
                        child.set('__toggleMode', folderToggleMode);
                    }
                });
            }
            return folderToggleMode;
        }
        Ext.raise('Invalid folderToggleMode set in ' + this.self.getName() + ': ' + folderToggleMode + '; \'classic\' or \'ol3\' are valid.');
    },
    /**
     * Listens to the `remove` event and syncs the attached layergroup.
     *
     * @param {GeoExt.data.store.LayersTree} store The layer store.
     * @param {GeoExt.data.model.LayerTreeNode[]} records An array of the
     *     removed nodes.
     * @private
     */
    handleRemove: function(store, records) {
        var me = this;
        var keyRemoveOptOut = me.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
        me.suspendCollectionEvents();
        Ext.each(records, function(record) {
            if (keyRemoveOptOut in record && record[keyRemoveOptOut] === true) {
                delete record[keyRemoveOptOut];
                return;
            }
            var layerOrGroup = record.getOlLayer();
            if (layerOrGroup instanceof ol.layer.Group) {
                me.unbindGroupLayerCollectionEvents(layerOrGroup);
            }
            var group = GeoExt.util.Layer.findParentGroup(layerOrGroup, me.getLayerGroup());
            if (!group) {
                group = me.getLayerGroup();
            }
            if (group) {
                group.getLayers().remove(layerOrGroup);
            }
        });
        me.resumeCollectionEvents();
    },
    /**
     * Listens to the `noderemove` event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode The parent node.
     * @param {GeoExt.data.model.LayerTreeNode} removedNode The removed node.
     * @private
     */
    handleNodeRemove: function(parentNode, removedNode) {
        var me = this;
        var layerOrGroup = removedNode.getOlLayer();
        if (!layerOrGroup) {
            layerOrGroup = me.getLayerGroup();
        }
        if (layerOrGroup instanceof ol.layer.Group) {
            removedNode.un('beforeexpand', me.onBeforeGroupNodeToggle);
            removedNode.un('beforecollapse', me.onBeforeGroupNodeToggle);
            me.unbindGroupLayerCollectionEvents(layerOrGroup);
        }
        var group = GeoExt.util.Layer.findParentGroup(layerOrGroup, me.getLayerGroup());
        if (group) {
            me.suspendCollectionEvents();
            group.getLayers().remove(layerOrGroup);
            me.resumeCollectionEvents();
        }
    },
    /**
     * Listens to the `nodeappend` event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode The parent node.
     * @param {GeoExt.data.model.LayerTreeNode} appendedNode The appended node.
     * @private
     */
    handleNodeAppend: function(parentNode, appendedNode) {
        var me = this;
        var group = parentNode.getOlLayer();
        var layer = appendedNode.getOlLayer();
        if (!group) {
            group = me.getLayerGroup();
        }
        // check if the layer is possibly already at the desired index:
        var layerInGroupIdx = GeoExt.util.Layer.getLayerIndex(layer, group);
        if (layerInGroupIdx === -1) {
            me.suspendCollectionEvents();
            if (me.inverseLayerOrder) {
                group.getLayers().insertAt(0, layer);
            } else {
                group.getLayers().push(layer);
            }
            me.resumeCollectionEvents();
        }
    },
    /**
     * Listens to the `nodeinsert` event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode The parent node.
     * @param {GeoExt.data.model.LayerTreeNode} insertedNode The inserted node.
     * @param {GeoExt.data.model.LayerTreeNode} insertedBefore The node we were
     *     inserted before.
     * @private
     */
    handleNodeInsert: function(parentNode, insertedNode, insertedBefore) {
        var me = this;
        var group = parentNode.getOlLayer();
        if (!group) {
            // can only happen if a node was dragged before the visible root.
            group = me.getLayerGroup();
        }
        var layer = insertedNode.getOlLayer();
        var beforeLayer = insertedBefore.getOlLayer();
        var groupLayers = group.getLayers();
        var beforeIdx = GeoExt.util.Layer.getLayerIndex(beforeLayer, group);
        var insertIdx = beforeIdx;
        if (me.inverseLayerOrder) {
            insertIdx += 1;
        }
        // check if the layer is possibly already at the desired index:
        var currentLayerInGroupIdx = GeoExt.util.Layer.getLayerIndex(layer, group);
        if (currentLayerInGroupIdx !== insertIdx && !Ext.Array.contains(groupLayers.getArray(), layer)) {
            me.suspendCollectionEvents();
            groupLayers.insertAt(insertIdx, layer);
            me.resumeCollectionEvents();
        }
    },
    /**
     * Adds a layer as a node to the store. It can be an `ol.layer.Base`.
     *
     * @param {ol.layer.Base} layerOrGroup The layer or layer group to add.
     */
    addLayerNode: function(layerOrGroup) {
        var me = this;
        // 2. get group to which the layer was added
        var group = GeoExt.util.Layer.findParentGroup(layerOrGroup, me.getLayerGroup());
        // 3. get index of layer in that group
        var layerIdx = GeoExt.util.Layer.getLayerIndex(layerOrGroup, group);
        // 3.1 the index must probably be changed because of inverseLayerOrder
        // TODO Check
        if (me.inverseLayerOrder) {
            var totalInGroup = group.getLayers().getLength();
            layerIdx = totalInGroup - layerIdx - 1;
        }
        // 4. find the node that represents the group
        var parentNode;
        if (group === me.getLayerGroup()) {
            parentNode = me.getRootNode();
        } else {
            parentNode = me.getRootNode().findChildBy(function(candidate) {
                return candidate.getOlLayer() === group;
            }, me, true);
        }
        if (!parentNode) {
            return;
        }
        // 5. insert a new layer node at the specified index to that node
        var layerNode = parentNode.insertChild(layerIdx, layerOrGroup);
        if (layerOrGroup instanceof ol.layer.Group) {
            // See onBeforeGroupNodeToggle for an explanation why we have this
            layerNode.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
            layerNode.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
            var childLayers = layerOrGroup.getLayers().getArray();
            Ext.each(childLayers, me.addLayerNode, me, me.inverseLayerOrder);
        }
    },
    /**
     * Bound as an eventlistener for layer nodes which are a folder / group on
     * the beforecollapse event. Whenever a folder gets collapsed, ExtJS seems
     * to actually remove the children from the store, triggering the removal
     * of the actual layers in the map. This is an undesired behaviour. We
     * handle this as follows: Before the collapsing happens, we mark the
     * childNodes, so we effectively opt-out in #handleRemove.
     *
     * @param {Ext.data.NodeInterface} node The collapsible folder node.
     * @private
     */
    onBeforeGroupNodeToggle: function(node) {
        var keyRemoveOptOut = this.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
        node.cascadeBy(function(child) {
            child[keyRemoveOptOut] = true;
        });
    },
    /**
     * A utility method which binds collection change events to the passed layer
     * if it is a `ol.layer.Group`.
     *
     * @param {ol.layer.Base} layerOrGroup The layer to probably bind event
     *     listeners for collection change events to.
     * @private
     */
    bindGroupLayerCollectionEvents: function(layerOrGroup) {
        var me = this;
        if (layerOrGroup instanceof ol.layer.Group) {
            var collection = layerOrGroup.getLayers();
            collection.on('remove', me.onLayerCollectionRemove);
            collection.on('add', me.onLayerCollectionAdd);
            collection.forEach(me.bindGroupLayerCollectionEvents);
        }
    },
    /**
     * A utility method which unbinds collection change events from the passed
     * layer if it is a `ol.layer.Group`.
     *
     * @param {ol.layer.Base} layerOrGroup The layer to probably unbind event
     *     listeners for collection change events from.
     * @private
     */
    unbindGroupLayerCollectionEvents: function(layerOrGroup) {
        var me = this;
        if (layerOrGroup instanceof ol.layer.Group) {
            var collection = layerOrGroup.getLayers();
            collection.un('remove', me.onLayerCollectionRemove);
            collection.un('add', me.onLayerCollectionAdd);
            collection.forEach(me.unbindGroupLayerCollectionEvents);
        }
    },
    /**
     * Handles the `add` event of a managed `ol.layer.Group` and eventually
     * removes the appropriate node.
     *
     * @param {ol.CollectionEvent} evt The event object holding a reference to
     *     the relevant `ol.layer.Base`.
     * @private
     */
    onLayerCollectionAdd: function(evt) {
        var me = this;
        if (me.collectionEventsSuspended) {
            return;
        }
        var layerOrGroup = evt.element;
        me.addLayerNode(layerOrGroup);
        me.bindGroupLayerCollectionEvents(layerOrGroup);
    },
    /**
     * Handles the `remove` event of a managed `ol.layer.Group` and eventually
     * removes the appropriate node.
     *
     * @param {ol.CollectionEvent} evt The event object holding a reference to
     *     the relevant `ol.layer.Base`.
     * @private
     */
    onLayerCollectionRemove: function(evt) {
        var me = this;
        if (me.collectionEventsSuspended) {
            return;
        }
        var layerOrGroup = evt.element;
        // 1. find the node that existed for that layer
        var node = me.getRootNode().findChildBy(function(candidate) {
                return candidate.getOlLayer() === layerOrGroup;
            }, me, true);
        if (!node) {
            return;
        }
        // 2. if grouplayer: cascade down and remove any possible listeners
        if (layerOrGroup instanceof ol.layer.Group) {
            me.unbindGroupLayerCollectionEvents(layerOrGroup);
        }
        // 3. find the parent
        var parent = node.parentNode;
        // 4. remove the node from the parent
        parent.removeChild(node);
    },
    /**
     * Allows for temporarily unlistening to change events on the underlying
     * OpenLayers collections. Use #resumeCollectionEvents to start listening
     * again.
     */
    suspendCollectionEvents: function() {
        this.collectionEventsSuspended = true;
    },
    /**
     * Undoes the effect of #suspendCollectionEvents; so that the store is now
     * listening to change events on the underlying OpenLayers collections
     * again.
     */
    resumeCollectionEvents: function() {
        this.collectionEventsSuspended = false;
    }
});

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
 * A utility class for converting ExtJS filters to OGC compliant filters
 *
 * @class GeoExt.util.OGCFilter
 */
Ext.define('GeoExt.util.OGCFilter', {
    statics: {
        /**
         * The WFS 1.0.0 GetFeature XML body template
         */
        wfs100GetFeatureXmlTpl: '<wfs:GetFeature service="WFS" version="1.0.0"' + ' outputFormat="JSON"' + ' xmlns:wfs="http://www.opengis.net/wfs"' + ' xmlns="http://www.opengis.net/ogc"' + ' xmlns:gml="http://www.opengis.net/gml"' + ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + ' xsi:schemaLocation="http://www.opengis.net/wfs' + ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">' + '<wfs:Query typeName="{0}">{1}' + '</wfs:Query>' + '</wfs:GetFeature>',
        /**
         * The WFS 1.1.0 GetFeature XML body template
         */
        wfs110GetFeatureXmlTpl: '<wfs:GetFeature service="WFS" version="1.1.0"' + ' outputFormat="JSON"' + ' xmlns:wfs="http://www.opengis.net/wfs"' + ' xmlns="http://www.opengis.net/ogc"' + ' xmlns:gml="http://www.opengis.net/gml"' + ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + ' xsi:schemaLocation="http://www.opengis.net/wfs' + ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">' + '<wfs:Query typeName="{0}">{1}' + '</wfs:Query>' + '</wfs:GetFeature>',
        /**
         * The WFS 2.0.0 GetFeature XML body template
         */
        wfs200GetFeatureXmlTpl: '<wfs:GetFeature service="WFS" version="2.0.0" ' + 'xmlns:wfs="http://www.opengis.net/wfs/2.0" ' + 'xmlns:fes="http://www.opengis.net/fes/2.0" ' + 'xmlns:gml="http://www.opengis.net/gml/3.2" ' + 'xmlns:sf="http://www.openplans.org/spearfish" ' + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' + 'xsi:schemaLocation="http://www.opengis.net/wfs/2.0 ' + 'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' + 'http://www.opengis.net/gml/3.2 ' + 'http://schemas.opengis.net/gml/3.2.1/gml.xsd">' + '<wfs:Query typeName="{0}">{1}' + '</wfs:Query>' + '</wfs:GetFeature>',
        /**
         * The template for spatial filters used in WFS 1.x.0 queries
         */
        spatialFilterWfs1xXmlTpl: '<{0}>' + '<PropertyName>{1}</PropertyName>' + '{2}' + '</{0}>',
        /**
         * The template for spatial filters used in WFS 2.0.0 queries
         */
        spatialFilterWfs2xXmlTpl: '<fes:{0}>' + '<fes:ValueReference>{1}</fes:ValueReference>' + '{2}' + '</fes:{0}>',
        /**
         * The template for spatial bbox filters used in WFS 1.x.0 queries
         */
        spatialFilterBBoxTpl: '<BBOX>' + '    <PropertyName>{0}</PropertyName>' + '    <gml:Envelope' + '        xmlns:gml="http://www.opengis.net/gml" srsName="{1}">' + '        <gml:lowerCorner>{2} {3}</gml:lowerCorner>' + '        <gml:upperCorner>{4} {5}</gml:upperCorner>' + '    </gml:Envelope>' + '</BBOX>',
        /**
         * Template string for GML 3.2.1 polygon
         */
        gml32PolygonTpl: '<gml:Polygon gml:id="P1" ' + 'srsName="urn:ogc:def:crs:{0}" srsDimension="2">' + '<gml:exterior>' + '<gml:LinearRing>' + '<gml:posList>{1}</gml:posList>' + '</gml:LinearRing>' + '</gml:exterior>' + '</gml:Polygon>',
        /**
         * Template string for GML 3.2.1 linestring
         */
        gml32LineStringTpl: '<gml:LineString gml:id="L1" ' + 'srsName="urn:ogc:def:crs:{0}" srsDimension="2">' + '<gml:posList>{1}</gml:posList>' + '</gml:LineString>',
        /**
         * Template string for GML 3.2.1 point
         */
        gml32PointTpl: '<gml:Point gml:id="Pt1" ' + 'srsName="urn:ogc:def:crs:{0}" srsDimension="2">' + '<gml:pos>{1}</gml:pos>' + '</gml:Point>',
        /**
         * The start element for a FE filter instance in version 2.0
         * as string value
         */
        filter20StartElementStr: '<fes:Filter ' + 'xsi:schemaLocation="http://www.opengis.net/fes/2.0 ' + 'http://schemas.opengis.net/filter/2.0/filterAll.xsd ' + 'http://www.opengis.net/gml/3.2 ' + 'http://schemas.opengis.net/gml/3.2.1/gml.xsd" ' + 'xmlns:fes="http://www.opengis.net/fes/2.0" ' + 'xmlns:gml="http://www.opengis.net/gml/3.2" ' + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
        /**
         * The list of supported topological and spatial filter operators
         */
        topologicalOrSpatialFilterOperators: [
            'intersect',
            'within',
            'contains',
            'equals',
            'disjoint',
            'crosses',
            'touches',
            'overlaps',
            'bbox'
        ],
        /**
         * Given an array of ExtJS grid-filters, this method will return an OGC
         * compliant filter which can be used for WMS requests
         * @param {Ext.util.Filter[]} filters array containing all
         *   `Ext.util.Filter` that should be converted
         * @param {string} combinator The combinator used for combining multiple
         *   filters. Can be 'and' or 'or'
         * @return {string} The OGC Filter XML
         */
        getOgcWmsFilterFromExtJsFilter: function(filters, combinator) {
            return GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(filters, 'wms', combinator);
        },
        /**
         * Given an array of ExtJS grid-filters, this method will return an OGC
         * compliant filter which can be used for WFS requests
         * @param {Ext.util.Filter[]} filters array containing all
         *   `Ext.util.Filter` that should be converted
         * @param {string} combinator The combinator used for combining multiple
         *   filters. Can be 'and' or 'or'
         * @param {string} wfsVersion The WFS version to use, either `1.0.0`,
         *   `1.1.0` or `2.0.0`
         * @return {string} The OGC Filter XML
         */
        getOgcWfsFilterFromExtJsFilter: function(filters, combinator, wfsVersion) {
            return GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(filters, 'wfs', combinator, wfsVersion);
        },
        /**
         * Given an ExtJS grid-filter, this method will return an OGC compliant
         * filter which can be used for WMS or WFS queries
         * @param {Ext.util.Filter[]} filters array containing all
         *   `Ext.util.Filter` that should be converted
         * @param {string} type The OGC type we will be using, can be
         *   `wms` or `wfs`
         * @param {string} combinator The combinator used for combining multiple
         *   filters. Can be 'and' or 'or'
         * @param {string} wfsVersion The WFS version to use, either `1.0.0`,
         *   `1.1.0` or `2.0.0`
         * @return {string} The OGC Filter as XML String
         */
        getOgcFilterFromExtJsFilter: function(filters, type, combinator, wfsVersion) {
            if (!Ext.isDefined(filters) || !Ext.isArray(filters)) {
                Ext.Logger.error('Invalid filter argument given to ' + 'GeoExt.util.OGCFilter. You need to pass an array of ' + '"Ext.util.Filter"');
                return;
            }
            if (Ext.isEmpty(filters)) {
                return null;
            }
            var omitNamespaces = false;
            // filters for WMS layers need to omit the namespaces
            if (!Ext.isEmpty(type) && type.toLowerCase() === 'wms') {
                omitNamespaces = true;
            }
            var ogcFilters = [];
            var ogcUtil = GeoExt.util.OGCFilter;
            var filterBody;
            Ext.each(filters, function(filter) {
                filterBody = ogcUtil.getOgcFilterBodyFromExtJsFilterObject(filter, wfsVersion);
                if (filterBody) {
                    ogcFilters.push(filterBody);
                }
            });
            return ogcUtil.combineFilters(ogcFilters, combinator, omitNamespaces, wfsVersion);
        },
        /**
         * Converts given ExtJS grid-filter to an OGC compliant filter
         * body content.
         * @param {Ext.util.Filter} filter Instance of
         *   `Ext.util.Filter` which should be converted to OGC filter
         * @param {string} wfsVersion The WFS version to use, either `1.0.0`,
         *   `1.1.0` or `2.0.0`
         * @return {string} The OGC Filter body as XML String
         */
        getOgcFilterBodyFromExtJsFilterObject: function(filter, wfsVersion) {
            if (!Ext.isDefined(filter)) {
                Ext.Logger.error('Invalid filter argument given to ' + 'GeoExt.util.OGCFilter. You need to pass an instance of ' + '"Ext.util.Filter"');
                return;
            }
            var property = filter.getProperty();
            var operator = filter.getOperator();
            var value = filter.getValue();
            var srsName;
            if (filter.type === 'spatial') {
                srsName = filter.srsName;
            }
            if (Ext.isEmpty(property) || Ext.isEmpty(operator) || Ext.isEmpty(value)) {
                Ext.Logger.warn('Skipping a filter as some values ' + 'seem to be undefined');
                return;
            }
            if (filter.isDateValue) {
                if (filter.getDateFormat) {
                    value = Ext.Date.format(filter.getValue(), filter.getDateFormat());
                } else {
                    value = Ext.Date.format(filter.getValue(), 'Y-m-d');
                }
            }
            return GeoExt.util.OGCFilter.getOgcFilter(property, operator, value, wfsVersion, srsName);
        },
        /**
         * Returns a GetFeature XML body containing the filters
         * which can be used to directly request the features
         * @param {Ext.util.Filter[]} filters array containing all
         *   `Ext.util.Filter` that should be converted
         * @param {string} combinator The combinator used for combining multiple
         *   filters. Can be 'and' or 'or'
         * @param {string} wfsVersion The WFS version to use, either `1.0.0`,
         *   `1.1.0` or `2.0.0`
         * @param {string} typeName The featuretype name to be used
         * @return {string} the GetFeature XML body as string
         */
        buildWfsGetFeatureWithFilter: function(filters, combinator, wfsVersion, typeName) {
            var filter = GeoExt.util.OGCFilter.getOgcWfsFilterFromExtJsFilter(filters, combinator, wfsVersion);
            var tpl = GeoExt.util.OGCFilter.wfs100GetFeatureXmlTpl;
            if (wfsVersion && wfsVersion === '1.1.0') {
                tpl = GeoExt.util.OGCFilter.wfs110GetFeatureXmlTpl;
            } else if (wfsVersion && wfsVersion === '2.0.0') {
                tpl = GeoExt.util.OGCFilter.wfs200GetFeatureXmlTpl;
            }
            return Ext.String.format(tpl, typeName, filter);
        },
        /**
         * Returns an OGC filter for the given parameters.
         * @param {string} property The property to filter on
         * @param {string} operator The operator to use
         * @param {*} value The value for the filter
         * @param {string} wfsVersion The WFS version to use, either `1.0.0`,
         *   `1.1.0` or `2.0.0`
         * @param {string} srsName The code for the projection
         * @return {string} The OGC filter.
         */
        getOgcFilter: function(property, operator, value, wfsVersion, srsName) {
            if (Ext.isEmpty(property) || Ext.isEmpty(operator) || Ext.isEmpty(value)) {
                Ext.Logger.error('Invalid argument given to method ' + '`getOgcFilter`. You need to supply property, ' + 'operator and value.');
                return;
            }
            var ogcFilterType;
            var closingTag;
            var propName = 'PropertyName';
            var isWfs20 = !Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0';
            if (isWfs20) {
                propName = 'fes:ValueReference';
            }
            // always replace surrounding quotes
            if (!(value instanceof ol.geom.Geometry)) {
                value = value.toString().replace(/(^['])/g, '');
                value = value.toString().replace(/([']$)/g, '');
            }
            var wfsPrefix = (isWfs20 ? 'fes:' : '');
            switch (operator) {
                case '==':
                case '=':
                case 'eq':
                    ogcFilterType = wfsPrefix + 'PropertyIsEqualTo';
                    break;
                case '!==':
                case '!=':
                case 'ne':
                    ogcFilterType = wfsPrefix + 'PropertyIsNotEqualTo';
                    break;
                case 'lt':
                case '<':
                    ogcFilterType = wfsPrefix + 'PropertyIsLessThan';
                    break;
                case 'lte':
                case '<=':
                    ogcFilterType = wfsPrefix + 'PropertyIsLessThanOrEqualTo';
                    break;
                case 'gt':
                case '>':
                    ogcFilterType = wfsPrefix + 'PropertyIsGreaterThan';
                    break;
                case 'gte':
                case '>=':
                    ogcFilterType = wfsPrefix + 'PropertyIsGreaterThanOrEqualTo';
                    break;
                case 'like':
                    value = '*' + value + '*';
                    var likeFilterTpl = '<{0}PropertyIsLike wildCard="*" singleChar="."' + ' escape="!" matchCase="false">' + '<' + propName + '>' + property + '</' + propName + '>' + '<{0}Literal>' + value + '</{0}Literal>' + '</{0}PropertyIsLike>';
                    return Ext.String.format(likeFilterTpl, wfsPrefix);
                case 'in':
                    ogcFilterType = wfsPrefix + 'Or';
                    var values = value;
                    if (!Ext.isArray(value)) {
                        // cleanup brackets and quotes
                        value = value.replace(/([()'])/g, '');
                        values = value.split(',');
                    };
                    var filters = '';
                    Ext.each(values || value, function(val) {
                        filters += '<' + wfsPrefix + 'PropertyIsEqualTo>' + '<' + propName + '>' + property + '</' + propName + '>' + '<' + wfsPrefix + 'Literal>' + val + '</' + wfsPrefix + 'Literal>' + '</' + wfsPrefix + 'PropertyIsEqualTo>';
                    });
                    ogcFilterType = '<' + ogcFilterType + '>';
                    var inFilter;
                    closingTag = Ext.String.insert(ogcFilterType, '/', 1);
                    // only use an Or filter when there are multiple values
                    if (values.length > 1) {
                        inFilter = ogcFilterType + filters + closingTag;
                    } else {
                        inFilter = filters;
                    };
                    return inFilter;
                case 'intersect':
                case 'within':
                case 'contains':
                case 'equals':
                case 'disjoint':
                case 'crosses':
                case 'touches':
                case 'overlaps':
                    switch (operator) {
                        case 'equals':
                            ogcFilterType = 'Equals';
                            break;
                        case 'contains':
                            ogcFilterType = 'Contains';
                            break;
                        case 'within':
                            ogcFilterType = 'Within';
                            break;
                        case 'disjoint':
                            ogcFilterType = 'Disjoint';
                            break;
                        case 'touches':
                            ogcFilterType = 'Touches';
                            break;
                        case 'crosses':
                            ogcFilterType = 'Crosses';
                            break;
                        case 'overlaps':
                            ogcFilterType = 'Overlaps';
                            break;
                        case 'intersect':
                            ogcFilterType = 'Intersects';
                            break;
                        default:
                            Ext.Logger.warn('Method `getOgcFilter` could not ' + 'handle the given topological operator: ' + operator);
                            return;
                    };
                    var gmlElement = GeoExt.util.OGCFilter.getGmlElementForGeometry(value, srsName, wfsVersion);
                    var spatialTpl = wfsVersion !== '2.0.0' ? GeoExt.util.OGCFilter.spatialFilterWfs1xXmlTpl : GeoExt.util.OGCFilter.spatialFilterWfs2xXmlTpl;
                    return Ext.String.format(spatialTpl, ogcFilterType, property, gmlElement);
                case 'bbox':
                    var llx;
                    var lly;
                    var urx;
                    var ury;
                    value = value.getExtent();
                    llx = value[0];
                    lly = value[1];
                    urx = value[2];
                    ury = value[3];
                    return Ext.String.format(GeoExt.util.OGCFilter.spatialFilterBBoxTpl, property, srsName, llx, lly, urx, ury);
                default:
                    Ext.Logger.warn('Method `getOgcFilter` could not ' + 'handle the given operator: ' + operator);
                    return;
            }
            ogcFilterType = '<' + ogcFilterType + '>';
            closingTag = Ext.String.insert(ogcFilterType, '/', 1);
            var literalStr = isWfs20 ? '<fes:Literal>{2}</fes:Literal>' : '<Literal>{2}</Literal>';
            var tpl = '' + '{0}' + '<' + propName + '>{1}</' + propName + '>' + literalStr + '{3}';
            var filter = Ext.String.format(tpl, ogcFilterType, property, value, closingTag);
            return filter;
        },
        /**
         * Returns a serialized geometry in GML3 format
         * @param {ol.geometry.Geometry} geometry The geometry to serialize
         * @param {String} srsName The epsg code to use to serialization
         * @param {String} wfsVersion The WFS version to use (WFS 2.0.0
         * requires gml prefix for geometries)
         * @return {string} The serialized geometry in GML3 format
         */
        getGmlElementForGeometry: function(geometry, srsName, wfsVersion) {
            if (wfsVersion === '2.0.0') {
                // supported geometries: Point, LineString and Polygon
                // in case of multigeometries, the first one is used.
                var geometryType = geometry.getType();
                var staticMe = GeoExt.util.OGCFilter;
                var isMulti = geometryType.indexOf('Multi') > -1;
                switch (geometryType) {
                    case 'Polygon':
                    case 'MultiPolygon':
                        var coordsPoly = geometry.getCoordinates()[0];
                        if (isMulti) {
                            coordsPoly = coordsPoly[0];
                        };
                        return Ext.String.format(staticMe.gml32PolygonTpl, srsName, staticMe.flattenCoordinates(coordsPoly));
                    case 'LineString':
                    case 'MultiLineString':
                        var coordsLine = geometry.getCoordinates();
                        if (isMulti) {
                            coordsLine = coordsLine[0];
                        };
                        return Ext.String.format(staticMe.gml32LineStringTpl, srsName, staticMe.flattenCoordinates(coordsLine));
                    case 'Point':
                    case 'MultiPoint':
                        var coordsPt = geometry.getCoordinates();
                        if (isMulti) {
                            coordsPt = coordsPt[0];
                        };
                        return Ext.String.format(staticMe.gml32PointTpl, srsName, staticMe.flattenCoordinates(coordsPt));
                    default:
                        return '';
                }
            } else {
                var format = new ol.format.GML3({
                        srsName: srsName
                    });
                var geometryNode = format.writeGeometryNode(geometry, {
                        dataProjection: srsName
                    });
                if (!geometryNode) {
                    Ext.Logger.warn('Could not serialize geometry');
                    return null;
                }
                var childNodes = geometryNode.children || geometryNode.childNodes;
                var serializer = new XMLSerializer();
                var geomNode = childNodes[0];
                var serializedValue = serializer.serializeToString(geomNode);
                return serializedValue;
            }
        },
        /**
         * Reduce an ol.Coordinate array to a string of whitespace
         * separated coordinate values
         * @param {ol.Coordinate []} coordArray An array of
         * coordinates
         * @return {string} Concatenated array of coordinates
         */
        flattenCoordinates: function(coordArray) {
            return Ext.Array.map(coordArray, function(cp) {
                return cp.join(' ');
            }).join(' ');
        },
        /**
         * Combines the passed filter bodies with an `<And>` or `<Or>` and
         * returns them. E.g. created with
         * GeoExt.util.OGCFilter.getOgcFilterBodyFromExtJsFilterObject
         *
         * @param {Array} filterBodies The filter bodies to join.
         * @param {string} combinator The combinator to use, should be
         *     either `And` (the default) or `Or`.
         * @param {string} wfsVersion The WFS version to use, either `1.0.0`,
         *   `1.1.0` or `2.0.0`
         * @return {string} And/Or combined OGC filter bodies.
         */
        combineFilterBodies: function(filterBodies, combinator, wfsVersion) {
            if (!Ext.isDefined(filterBodies) || !Ext.isArray(filterBodies) || filterBodies.length === 0) {
                Ext.Logger.error('Invalid "filterBodies" argument given to ' + 'GeoExt.util.OGCFilter. You need to pass an array of ' + 'OGC filter bodies as XML string');
                return;
            }
            var combineWith = combinator || 'And';
            var isWfs20 = !Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0';
            var wfsPrefix = (isWfs20 ? 'fes:' : '');
            var ogcFilterType = wfsPrefix + combineWith;
            var openingTag = ogcFilterType = '<' + ogcFilterType + '>';
            var closingTag = Ext.String.insert(openingTag, '/', 1);
            var combinedFilterBodies = '';
            // only use an And/Or filter when there are multiple filter bodies
            if (filterBodies.length > 1) {
                Ext.each(filterBodies, function(filterBody) {
                    combinedFilterBodies += filterBody;
                });
                combinedFilterBodies = openingTag + combinedFilterBodies + closingTag;
            } else {
                combinedFilterBodies = filterBodies[0];
            }
            return combinedFilterBodies;
        },
        /**
         * Combines the passed filters with an `<And>` or `<Or>` and
         * returns them.
         *
         * @param {Array} filters The filters to join.
         * @param {string} combinator The combinator to use, should be
         *     either `And` (the default) or `Or`.
         * @param {boolean} omitNamespaces Indicates if namespaces
         *   should be omitted in filters, which is useful for WMS
         * @param {string} wfsVersion The WFS version to use, either `1.0.0`,
         *   `1.1.0` or `2.0.0`
         * @return {string} An combined OGC filter with the passed filters.
         */
        combineFilters: function(filters, combinator, omitNamespaces, wfsVersion) {
            var staticMe = GeoExt.util.OGCFilter;
            var defaultCombineWith = 'And';
            var combineWith = combinator || defaultCombineWith;
            var numFilters = filters.length;
            var parts = [];
            var ns = omitNamespaces ? '' : 'ogc';
            var omitNamespaceFromWfsVersion = !wfsVersion || wfsVersion === '1.0.0';
            if (!Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0' && !omitNamespaces) {
                parts.push(staticMe.filter20StartElementStr);
            } else {
                parts.push('<Filter' + (omitNamespaces ? '' : ' xmlns="http://www.opengis.net/' + ns + '"' + ' xmlns:gml="http://www.opengis.net/gml"') + '>');
                omitNamespaceFromWfsVersion = true;
            }
            parts.push();
            if (numFilters > 1) {
                parts.push('<' + (omitNamespaces || omitNamespaceFromWfsVersion ? '' : 'fes:') + combineWith + '>');
            }
            Ext.each(filters, function(filter) {
                parts.push(filter);
            });
            if (numFilters > 1) {
                parts.push('</' + (omitNamespaces || omitNamespaceFromWfsVersion ? '' : 'fes:') + combineWith + '>');
            }
            parts.push('</' + (omitNamespaces || omitNamespaceFromWfsVersion ? '' : 'fes:') + 'Filter>');
            return parts.join('');
        },
        /**
         * Create an instance of {Ext.util.Filter} that contains the required
         * information on spatial filter, e.g. operator and geometry
         *
         * @param {string} operator The spatial / toplogical operator
         * @param {string} typeName The name of geometry field
         * @param {ol.geom.Geometry} value The geometry to use for filtering
         * @param {string} srsName The EPSG code of the geometry
         *
         * @return {Ext.util.Filter} A 'spatial' {Ext.util.Filter}
         */
        createSpatialFilter: function(operator, typeName, value, srsName) {
            if (!Ext.Array.contains(GeoExt.util.OGCFilter.topologicalOrSpatialFilterOperators, operator)) {
                return null;
            }
            // construct an instance of Filter
            return new Ext.util.Filter({
                type: 'spatial',
                srsName: srsName,
                operator: operator,
                property: typeName,
                value: value
            });
        }
    }
});

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
 * A data store loading features from an OGC WFS.
 *
 * @class GeoExt.data.store.WfsFeatures
 */
Ext.define('GeoExt.data.store.WfsFeatures', {
    extend: 'GeoExt.data.store.Features',
    mixins: [
        'GeoExt.mixin.SymbolCheck',
        'GeoExt.util.OGCFilter'
    ],
    /**
     * If autoLoad is true, this store's loadWfs method is automatically called
     * after creation.
     * @cfg {Boolean}
     */
    autoLoad: true,
    /**
     * Default to using server side sorting
     * @cfg {Boolean}
     */
    remoteSort: true,
    /**
     * Default to using server side filtering
     * @cfg {Boolean}
     */
    remoteFilter: true,
    /**
     * Default logical comperator to combine filters sent to WFS
     * @cfg {String}
     */
    logicalFilterCombinator: 'And',
    /**
      * Default request method to use in AJAX requests
      * @cfg {String}
      */
    requestMethod: 'GET',
    /**
     * The 'service' param value used in the WFS request.
     * @cfg {String}
     */
    service: 'WFS',
    /**
     * The 'version' param value used in the WFS request.
     * This should be '2.0.0' or higher at least if the paging mechanism
     * should be used.
     * @cfg {String}
     */
    version: '2.0.0',
    /**
     * The 'request' param value used in the WFS request.
     * @cfg {String}
     */
    request: 'GetFeature',
    /**
     * The 'typeName' param value used in the WFS request.
     * @cfg {String}
     */
    typeName: null,
    /**
     * The 'srsName' param value used in the WFS request. If not set
     * it is automatically set to the map projection when available.
     * @cfg {String}
     */
    srsName: null,
    /**
     * The 'outputFormat' param value used in the WFS request.
     * @cfg {String}
     */
    outputFormat: 'application/json',
    /**
     * The 'startIndex' param value used in the WFS request.
     * @cfg {String}
     */
    startIndex: 0,
    /**
     * The 'count' param value used in the WFS request.
     * @cfg {String}
     */
    count: null,
    /**
     * A comma-separated list of property names to retrieve
     * from the server. If left as null all properties are returned.
     * @cfg {String}
     */
    propertyName: null,
    /**
     * Offset to add to the #startIndex in the WFS request.
     * @cfg {Number}
     */
    startIndexOffset: 0,
    /**
     * The OL format used to parse the WFS GetFeature response.
     * @cfg {ol.format.Feature}
     */
    format: null,
    /**
     * The attribution added to the created vector layer source. Only has an
     * effect if #createLayer is set to `true`
     * @cfg {String}
     */
    layerAttribution: null,
    /**
     * Additional OpenLayers properties to apply to the created vector layer.
     * Only has an effect if #createLayer is set to `true`
     * @cfg {String}
     */
    layerOptions: null,
    /**
     * Cache the total number of features be queried from when the store is
     * first loaded to use for the remaining life of the store.
     * This uses resultType=hits to get the number of features and can improve
     * performance rather than calculating on each request. It should be used
     * for read-only layers, or when the server does not return the
     * feature count on each request.
     * @cfg {Boolean}
     */
    cacheFeatureCount: false,
    /**
     * The outputFormat sent with the resultType=hits request.
     * Defaults to GML3 as some WFS servers do not support this
     * request type when using application/json.
     * Only has an effect if #cacheFeatureCount is set to `true`
     * @cfg {Boolean}
     */
    featureCountOutputFormat: 'gml3',
    /**
     * Time any request will be debounced. This will prevent too
     * many successive request.
     * @cfg {number}
     */
    debounce: 300,
    /**
     * Constructs the WFS feature store.
     *
     * @param {Object} config The configuration object.
     * @private
     */
    constructor: function(config) {
        var me = this;
        config = config || {};
        // apply count as store's pageSize
        config.pageSize = config.count || me.count;
        if (config.pageSize > 0) {
            // calculate initial page
            var startIndex = config.startIndex || me.startIndex;
            config.currentPage = Math.floor(startIndex / config.pageSize) + 1;
        }
        // avoid creation of vector layer by parent class (raises error when
        // applying WFS data) so we can create the WFS vector layer on our own
        // (if needed)
        var createLayer = config.createLayer;
        config.createLayer = false;
        me.callParent([
            config
        ]);
        me.loadWfsTask_ = new Ext.util.DelayedTask();
        if (!me.url) {
            Ext.raise('No URL given to WfsFeaturesStore');
        }
        if (createLayer) {
            // the WFS vector layer showing the WFS features on the map
            me.source = new ol.source.Vector({
                features: new ol.Collection(),
                attributions: me.layerAttribution
            });
            var layerOptions = {
                    source: me.source,
                    style: me.style
                };
            if (me.layerOptions) {
                Ext.applyIf(layerOptions, me.layerOptions);
            }
            me.layer = new ol.layer.Vector(layerOptions);
            me.layerCreated = true;
        }
        if (me.cacheFeatureCount === true) {
            me.cacheTotalFeatureCount(!me.autoLoad);
        } else {
            if (me.autoLoad) {
                // initial load of the WFS data
                me.loadWfs();
            }
        }
        // before the store gets re-loaded (e.g. by a paging toolbar) we trigger
        // the re-loading of the WFS, so the data keeps in sync
        me.on('beforeload', me.loadWfs, me);
        // add layer to connected map, if available
        if (me.map && me.layer) {
            me.map.addLayer(me.layer);
        }
    },
    /**
     * Detects the total amount of features (without paging) of the given
     * WFS response. The detection is based on the response format (currently
     * GeoJSON and GML >=v3 are supported).
     *
     * @private
     * @param  {Object} wfsResponse The XMLHttpRequest object
     * @return {Number}            Total amount of features
     */
    getTotalFeatureCount: function(wfsResponse) {
        var totalCount = -1;
        // get the response type from the header
        var contentType = wfsResponse.getResponseHeader('Content-Type');
        try {
            if (contentType.indexOf('application/json') !== -1) {
                var respJson = Ext.decode(wfsResponse.responseText);
                totalCount = respJson.numberMatched;
            } else {
                // assume GML
                var xml = wfsResponse.responseXML;
                if (xml && xml.firstChild) {
                    var total = xml.firstChild.getAttribute('numberMatched');
                    totalCount = parseInt(total, 10);
                }
            }
        } catch (e) {
            Ext.Logger.warn('Error while detecting total feature count from ' + 'WFS response');
        }
        return totalCount;
    },
    /**
     * Sends the sortBy parameter to the WFS Server
     * If multiple sorters are specified then multiple fields are
     * sent to the server.
     * Ascending sorts will append ASC and descending sorts DESC
     * E.g. sortBy=attribute1 DESC,attribute2 ASC
     * @private
     * @return {String} The sortBy string
     */
    createSortByParameter: function() {
        var me = this;
        var sortStrings = [];
        var direction;
        var property;
        me.getSorters().each(function(sorter) {
            // direction will be ASC or DESC
            direction = sorter.getDirection();
            property = sorter.getProperty();
            sortStrings.push(Ext.String.format('{0} {1}', property, direction));
        });
        return sortStrings.join(',');
    },
    /**
     * Create filter parameter string (according to Filter Encoding standard)
     * based on the given instances in filters ({Ext.util.FilterCollection}) of
     * the store.
     *
     * @private
     * @return {String} The filter XML encoded as string
     */
    createOgcFilter: function() {
        var me = this;
        var filters = [];
        me.getFilters().each(function(item) {
            filters.push(item);
        });
        if (filters.length === 0) {
            return null;
        }
        return GeoExt.util.OGCFilter.getOgcWfsFilterFromExtJsFilter(filters, me.logicalFilterCombinator, me.version);
    },
    /**
     * Gets the number of features for the WFS typeName
     * using resultType=hits and caches it so it only needs to be calculated
     * the first time the store is used.
     *
     * @param  {Boolean} skipLoad Avoids loading the store if set to `true`
     * @private
     */
    cacheTotalFeatureCount: function(skipLoad) {
        var me = this;
        var url = me.url;
        me.cachedTotalCount = 0;
        var params = {
                service: me.service,
                version: me.version,
                request: me.request,
                typeName: me.typeName,
                outputFormat: me.featureCountOutputFormat,
                resultType: 'hits'
            };
        Ext.Ajax.request({
            url: url,
            method: me.requestMethod,
            params: params,
            success: function(resp) {
                // set number of total features (needed for paging)
                me.cachedTotalCount = me.getTotalFeatureCount(resp);
                if (!skipLoad) {
                    me.loadWfs();
                }
            },
            failure: function(resp) {
                Ext.Logger.warn('Error while requesting features from WFS: ' + resp.responseText + ' Status: ' + resp.status);
            }
        });
    },
    /**
     * Handles the 'filterchange'-event.
     * Reload data using updated filter config.
     * @private
     */
    onFilterChange: function() {
        var me = this;
        if (me.getFilters() && me.getFilters().length > 0) {
            me.loadWfs();
        }
    },
    /**
     * Loads the data from the connected WFS.
     * @private
     */
    loadWfs: function() {
        var me = this;
        if (me.loadWfsTask_.id === null) {
            me.loadWfsTask_.delay(me.debounce, function() {});
            me.loadWfsInternal();
        } else {
            me.loadWfsTask_.delay(me.debounce, function() {
                me.loadWfsInternal();
            });
        }
    },
    loadWfsInternal: function() {
        var me = this;
        var url = me.url;
        var params = {
                service: me.service,
                version: me.version,
                request: me.request,
                typeName: me.typeName,
                outputFormat: me.outputFormat
            };
        // add a propertyName parameter if set
        if (me.propertyName !== null) {
            params.propertyName = me.propertyName;
        }
        // add a srsName parameter
        if (me.srsName) {
            params.srsName = me.srsName;
        } else {
            // if it has not been set manually retrieve from the map
            if (me.map) {
                params.srsName = me.map.getView().getProjection().getCode();
            }
        }
        // send the sortBy parameter only when remoteSort is true
        // as it is not supported by all WFS servers
        if (me.remoteSort === true) {
            var sortBy = me.createSortByParameter();
            if (sortBy) {
                params.sortBy = sortBy;
            }
        }
        // create filter string if remoteFilter is activated
        if (me.remoteFilter === true) {
            var filter = me.createOgcFilter();
            if (filter) {
                params.filter = filter;
            }
        }
        // apply paging parameters if necessary
        if (me.pageSize) {
            me.startIndex = ((me.currentPage - 1) * me.pageSize) + me.startIndexOffset;
            params.startIndex = me.startIndex;
            params.count = me.pageSize;
        }
        // fire event 'gx-wfsstoreload-beforeload' and skip loading if listener
        // function returns false
        if (me.fireEvent('gx-wfsstoreload-beforeload', me, params) === false) {
            return;
        }
        // request features from WFS
        Ext.Ajax.request({
            url: url,
            method: me.requestMethod,
            params: params,
            success: function(resp) {
                if (!me.format) {
                    Ext.Logger.warn('No format given for WfsFeatureStore. ' + 'Skip parsing feature data.');
                    return;
                }
                if (me.cacheFeatureCount === true) {
                    // me.totalCount is reset to 0 on each load so reset it here
                    me.totalCount = me.cachedTotalCount;
                } else {
                    // set number of total features (needed for paging)
                    me.totalCount = me.getTotalFeatureCount(resp);
                }
                // parse WFS response to OL features
                var wfsFeats = [];
                try {
                    wfsFeats = me.format.readFeatures(resp.responseText);
                } catch (error) {
                    Ext.Logger.warn('Error parsing features into the ' + 'OpenLayers format. Check the server response.');
                }
                // set data for store
                me.setData(wfsFeats);
                if (me.layer) {
                    // add features to WFS layer
                    me.source.clear();
                    me.source.addFeatures(wfsFeats);
                }
                me.fireEvent('gx-wfsstoreload', me, wfsFeats, true);
            },
            failure: function(resp) {
                if (resp.aborted !== true) {
                    Ext.Logger.warn('Error while requesting features from WFS: ' + resp.responseText + ' Status: ' + resp.status);
                }
                me.fireEvent('gx-wfsstoreload', me, null, false);
            }
        });
    },
    doDestroy: function() {
        var me = this;
        if (me.loadWfsTask_.id !== null) {
            me.loadWfsTask_.cancel();
        }
        me.callParent(arguments);
    }
});

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
 * (Abstract) plugin for an Ext.tree.Column used in an layer tree in order to
 * render a custom UI component on right-click of a LayerTreeNode, e. g. a menu
 * (like `Ext.menu.Menu`).
 *
 * The UI creation can be adapted by overwriting the #createContextUi
 * function.
 *
 * @class GeoExt.plugin.layertreenode.ContextMenu
 */
Ext.define('GeoExt.plugin.layertreenode.ContextMenu', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.gx_layertreenode_contextmenu',
    /**
     * The UI component to be rendered when the LayerTreeNode is right clicked.
     *
     * @property {Ext.Component}
     */
    contextUi: null,
    /**
     * Flag to steer whether the #contextUi should be destroyed and re-created
     * every time the LayerTreeNode is right clicked.
     *
     * @cfg {Boolean}
     */
    recreateContextUi: true,
    /**
     * Initializes this plugin.
     *
     * @param  {Ext.tree.Column} treeColumn [description]
     * @private
     */
    init: function(treeColumn) {
        var me = this;
        if (!(treeColumn instanceof Ext.tree.Column)) {
            Ext.log.warn('Plugin shall only be applied to instances of' + ' Ext.tree.Column');
            return;
        }
        treeColumn.on('contextmenu', me.onContextMenu, me);
    },
    /**
     * Handles the 'contextmenu' event of the connected Ext.tree.Column.
     * Creates the UI by #createContextUi and shows the UI by #showContextUi.
     *
     * @param  {Ext.view.Table}  treeView The tree table view
     * @param  {HTMLElement}     td       The TD element for the cell.
     * @param  {Number}          rowIdx   Index of the row
     * @param  {Number}          colIdx   Index of the column
     * @param  {Ext.event.Event} evt      The original event object
     * @param  {GeoExt.data.model.LayerTreeNode} layerTreeNode
     *     LayerTreeNode holding the OL layer
     * @private
     */
    onContextMenu: function(treeView, td, rowIdx, colIdx, evt, layerTreeNode) {
        var me = this;
        evt.preventDefault();
        if (me.contextUi && me.recreateContextUi) {
            me.contextUi.destroy();
            me.contextUi = null;
        }
        if (!me.contextUi) {
            me.contextUi = me.createContextUi(layerTreeNode);
        }
        me.showContextUi(evt.getXY());
    },
    /**
     * Creates and returns the context UI, which is rendered when the
     * LayerTreeNode is right clicked.
     * Should be overwritten by concrete implementation of this plugin.
     *
     * @param  {GeoExt.data.model.LayerTreeNode} layerTreeNode
     *     LayerTreeNode holding the OL layer
     * @return {Ext.Component} The UI component to be shown on layer right-click
     */
    createContextUi: function(layerTreeNode) {
        Ext.Logger.warn('gx_layertreenode_contextmenu: createContextUi is ' + 'not overwritten. It is very likely that the plugin won\'t work');
        return null;
    },
    /**
     * Shows the context UI.
     * Can be overwritten by concrete implementation of this plugin.
     * Default shows the #contextUi at the position where the right-click was
     * performed.
     *
     * @param  {Number[]} clickPos The pixel position of the right-click
     */
    showContextUi: function(clickPos) {
        var me = this;
        if (me.contextUi && clickPos) {
            me.contextUi.showAt(clickPos);
        }
    }
});

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
 * Creates a combo box that handles results from a geocoding service. By
 * default it uses OSM Nominatim, but the component offers all config options
 * to overwrite in order to other custom services.
 * If the user enters a valid address in the search box, the combo's store will
 * be populated with records that match the
 * address. By default, records have the following fields:
 *
 *   * name   - `String` The formatted address.
 *   * extent - `ol.Extent` The extent of the matching address
 *   * bounds - `ol.Coordinate` The point coordinate of the matching address
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.form.field.GeocoderComboBox
 */
Ext.define('GeoExt.form.field.GeocoderComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: [
        'widget.gx_geocoder_combo',
        'widget.gx_geocoder_combobox',
        'widget.gx_geocoder_field'
    ],
    requires: [
        'Ext.data.JsonStore'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    /**
     * The OpenLayers map to work on. If not provided the selection of an
     * address would have no effect.
     *
     * @cfg {ol.Map}
     */
    map: null,
    /**
     * Vector layer to visualize the selected address.
     * Will be created if not provided.
     *
     * @cfg {ol.layer.Vector}
     * @property {ol.layer.Vector}
     */
    locationLayer: null,
    /**
     * The style of the #locationLayer. Only has an effect if the layer is not
     * passed in while creation.
     *
     * @cfg {ol.style.Style}
     */
    locationLayerStyle: null,
    /**
     * The store used for this combo box. Default is a
     * store with  the url configured as #url
     * config.
     *
     * @cfg {Ext.data.JsonStore}
     * @property {Ext.data.JsonStore}
     */
    store: null,
    /**
     * The property in the JSON response of the geocoding service used in
     * the store's proxy as root object.
     *
     * @cfg {String}
     */
    proxyRootProperty: null,
    /**
     * The field to display in the combobox result. Default is
     * "name" for instant use with the default store for this component.
     *
     * @cfg {String}
     */
    displayField: 'name',
    /**
     * The field in the GeoCoder service repsonse to be used as mapping for the
     * 'name' field in the #store.
     * Ignored when a store is passed in.
     *
     * @cfg {String}
     */
    displayValueMapping: 'display_name',
    /**
     * Field from selected record to use when the combo's
     * #getValue method is called. Default is "extent". This field is
     * supposed to contain an ol.Extent.
     * By setting this to 'coordinate' a field holding an ol.Coordinate is used.
     *
     * @cfg {String}
     */
    valueField: 'extent',
    /**
     * The query parameter for the user entered search text.
     * Default is 'q' for instant use with OSM Nominatim.
     *
     * @cfg {String}
     */
    queryParam: 'q',
    /**'Search'
     * Text to display for an empty field.
     *
     * @cfg {String}
     */
    emptyText: 'Search for a location',
    /**
     * Minimum number of entered characters to trigger a search.
     *
     * @cfg {Number}
     */
    minChars: 3,
    /**
     * Delay before the search occurs in ms.
     *
     * @cfg {Number}
     */
    queryDelay: 100,
    /**
     * URL template for querying the geocoding service. If a store is
     * configured, this will be ignored. Note that the #queryParam will be used
     * to append the user's combo box input to the url.
     *
     * @cfg {String}
     */
    url: 'https://nominatim.openstreetmap.org/search?format=json',
    /**
     * The SRS used by the geocoder service.
     *
     * @cfg {String}
     */
    srs: 'EPSG:4326',
    /**
     * Zoom level when zooming to a location (#valueField='coordinate')
     * Not used when zooming to extent.
     *
     * @cfg {Number}
     */
    zoom: 10,
    /**
     * Flag to steer if selected address feature is drawn on #map
     * (by #locationLayer).
     *
     * @cfg {Boolean}
     */
    showLocationOnMap: true,
    /**
     * Flag to restrict nomination query to current map extent
     *
     * @cfg {Boolean}
     */
    restrictToMapExtent: false,
    /**
     * @private
     */
    initComponent: function() {
        var me = this;
        me.updateExtraParams = me.updateExtraParams.bind(me);
        if (!me.store) {
            me.store = Ext.create('Ext.data.JsonStore', {
                fields: [
                    {
                        name: 'name',
                        mapping: me.displayValueMapping
                    },
                    {
                        name: 'extent',
                        convert: me.convertToExtent
                    },
                    {
                        name: 'coordinate',
                        convert: me.convertToCoordinate
                    }
                ],
                proxy: {
                    type: 'ajax',
                    url: me.url,
                    reader: {
                        type: 'json',
                        rootProperty: me.proxyRootProperty
                    }
                }
            });
        }
        if (!me.locationLayer) {
            me.locationLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: me.locationLayerStyle !== null ? me.locationLayerStyle : undefined
            });
            if (me.map) {
                me.map.addLayer(me.locationLayer);
            }
        }
        me.callParent(arguments);
        me.on({
            unRestrictMapExtent: me.unRestrictExtent,
            restrictToMapExtent: me.restrictExtent,
            select: me.onSelect,
            focus: me.onFocus,
            scope: me
        });
        if (me.restrictToMapExtent) {
            me.restrictExtent();
        }
    },
    /**
     * Handle restriction to viewbox: register moveend event
     * and update params of AJAX proxy
     */
    restrictExtent: function() {
        var me = this;
        me.map.on('moveend', me.updateExtraParams);
        me.updateExtraParams();
    },
    /**
     * Update viewbox parameter based on the current map extent
     */
    updateExtraParams: function() {
        var me = this;
        var mapSize = me.map.getSize();
        var mv = me.map.getView();
        var extent = mv.calculateExtent(mapSize);
        me.addMapExtentParams(extent, mv.getProjection());
    },
    /**
     * Update map extent params of AJAX proxy.
     *
     * By default, 'viewbox' and 'bounded' are updated since Nominatim is the
     * default geocoder in this class. If no projection is passed the one of
     * the map view is used.
     *
     * @param {ol.Extent} extent The extend to restrict the geocoder to
     * @param {ol.proj.Projection} projection The projection of given extent
     */
    addMapExtentParams: function(extent, projection) {
        var me = this;
        if (!projection) {
            projection = me.map.getView().getProjection();
        }
        var ll = ol.proj.transform([
                extent[0],
                extent[1]
            ], projection, 'EPSG:4326');
        var ur = ol.proj.transform([
                extent[2],
                extent[3]
            ], projection, 'EPSG:4326');
        ll = Ext.Array.map(ll, function(val) {
            return Math.min(Math.max(val, -180), 180);
        });
        ur = Ext.Array.map(ur, function(val) {
            return Math.min(Math.max(val, -180), 180);
        });
        var viewBoxStr = [
                ll.join(','),
                ur.join(',')
            ].join(',');
        if (me.store && me.store.getProxy()) {
            me.store.getProxy().setExtraParam('viewbox', viewBoxStr);
            me.store.getProxy().setExtraParam('bounded', '1');
        }
    },
    /**
     * Cleanup if extent restriction is omitted.
     * -> moveend event from map
     * -> call removeMapExtentParams to reset params set in store
     */
    unRestrictExtent: function() {
        var me = this;
        // unbinding moveend event
        me.map.un('moveend', me.updateExtraParams);
        // cleanup params in store
        me.removeMapExtentParams();
    },
    /**
     * Remove restriction to viewbox, in particular remove viewbox
     * and bounded parameters from AJAX proxy for nominatim queries
     */
    removeMapExtentParams: function() {
        var me = this;
        if (me.store && me.store.getProxy()) {
            me.store.getProxy().setExtraParam('viewbox', undefined);
            me.store.getProxy().setExtraParam('bounded', undefined);
        }
    },
    /**
     * Function to convert the data delivered by the geocoder service to an
     * ol.Extent ([minx, miny, maxx, maxy]).
     * Default implementation converts the Nominatim response.
     * Can be overwritten to work with other services.
     *
     * @param  {Mixed}          v   The data value as read by the Reader
     * @param  {Ext.data.Model} rec The data record containing raw data
     * @return {ol.Extent}          The created ol.Extent
     */
    convertToExtent: function(v, rec) {
        var rawExtent = rec.get('boundingbox');
        var minx = parseFloat(rawExtent[2], 10);
        var miny = parseFloat(rawExtent[0], 10);
        var maxx = parseFloat(rawExtent[3], 10);
        var maxy = parseFloat(rawExtent[1], 10);
        return [
            minx,
            miny,
            maxx,
            maxy
        ];
    },
    /**
     * Function to convert the data delivered by the geocoder service to an
     * ol.Coordinate ([x, y]).
     * Default implementation converts the Nominatim response.
     * Can be overwritten to work with other services.
     *
     * @param  {Mixed}          v   The data value as read by the Reader
     * @param  {Ext.data.Model} rec The data record containing raw data
     * @return {ol.Coordinate}      The created ol.Coordinate
     */
    convertToCoordinate: function(v, rec) {
        return [
            parseFloat(rec.get('lon'), 10),
            parseFloat(rec.get('lat'), 10)
        ];
    },
    /**
     * Draws the selected address feature on the map.
     *
     * @param  {ol.Coordinate | ol.Extent} coordOrExtent Location feature to be
     *   drawn on the map
     */
    drawLocationFeatureOnMap: function(coordOrExtent) {
        var me = this;
        var geom;
        if (coordOrExtent.length === 2) {
            geom = new ol.geom.Point(coordOrExtent);
        } else if (coordOrExtent.length === 4) {
            geom = ol.geom.Polygon.fromExtent(coordOrExtent);
        }
        if (geom) {
            var feat = new ol.Feature({
                    geometry: geom
                });
            me.locationLayer.getSource().clear();
            me.locationLayer.getSource().addFeature(feat);
        }
    },
    /**
     * Removes the drawn address feature from the map.
     */
    removeLocationFeature: function() {
        this.locationLayer.getSource().clear();
    },
    /**
     * Handles the 'focus' event of this ComboBox.
     */
    onFocus: function() {
        var me = this;
        me.clearValue();
        me.removeLocationFeature();
    },
    /**
     * Handles the 'select' event of this ComboBox.
     * Zooms to the selected address and draws the address feature on the map
     * (if configured in #showLocationOnMap)
     *
     * @param  {GeoExt.form.field.GeocoderComboBox} combo  [description]
     * @param  {Ext.data.Model} record [description]
     *
     * @private
     */
    onSelect: function(combo, record) {
        var me = this;
        if (!me.map) {
            Ext.Logger.warn('No map configured in ' + 'GeoExt.form.field.GeocoderComboBox. Skip zoom to selection.');
            return;
        }
        var value = record.get(me.valueField);
        var projValue;
        var olMapView = me.map.getView();
        var targetProj = olMapView.getProjection().getCode();
        if (value.length === 2) {
            // point based value
            projValue = ol.proj.transform(value, me.srs, targetProj);
            // adjust the map
            olMapView.setCenter(projValue);
            olMapView.setZoom(me.zoom);
        } else if (value.length === 4) {
            // bbox based value
            projValue = ol.proj.transformExtent(value, me.srs, targetProj);
            // adjust the map
            olMapView.fit(projValue);
        }
        if (me.showLocationOnMap) {
            me.drawLocationFeatureOnMap(projValue);
        }
    }
});

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
 * A mixin for selection model which enables automatic selection of features
 * in the map when rows are selected in the grid and vice-versa.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.selection.FeatureModelMixin
 */
Ext.define('GeoExt.selection.FeatureModelMixin', {
    extend: 'Ext.Mixin',
    mixinConfig: {
        after: {
            bindComponent: 'bindFeatureModel'
        },
        before: {
            destroy: 'unbindOlEvents',
            constructor: 'onConstruct',
            onSelectChange: 'beforeSelectChange'
        }
    },
    config: {
        /**
         * The connected vector layer.
         * @cfg {ol.layer.Vector}
         * @property {ol.layer.Vector}
         */
        layer: null,
        /**
         * The OpenLayers map we work with
         * @cfg {ol.Map}
         */
        map: null,
        /**
         * Set to true to create a click handler on the map selecting a clicked
         * object in the #layer.
         * @cfg {Boolean}
         */
        mapSelection: false,
        /**
         * Set a pixel tolerance for the map selection. Defaults to 12.
         */
        selectionTolerance: 12,
        /**
         * The default style for the selected features.
         * @cfg {ol.style.Style}
         */
        selectStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.8)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'darkblue',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.8)'
            }),
            stroke: new ol.style.Stroke({
                color: 'darkblue',
                width: 2
            })
        })
    },
    /**
     * Lookup to preserve existing feature styles. Used to restore feature style
     * when select style is removed.
     * @private
     * @property {Object}
     */
    existingFeatStyles: {},
    /**
     * Indicates if a map click handler has been registered on init.
     * @private
     * @property {Boolean}
     */
    mapClickRegistered: false,
    /**
     * The attribute key to mark an OL feature as selected.
     * @cfg {String}
     * @property
     * @readonly
     */
    selectedFeatureAttr: 'gx_selected',
    /**
     * The currently selected features (`ol.Collection` containing `ol.Feature`
     * instances).
     * @property {ol.Collection}
     */
    selectedFeatures: null,
    onConstruct: function() {
        var me = this;
        me.onSelectFeatAdd = me.onSelectFeatAdd.bind(me);
        me.onSelectFeatRemove = me.onSelectFeatRemove.bind(me);
        me.onFeatureClick = me.onFeatureClick.bind(me);
    },
    /**
     * Prepare several connected objects once the selection model is ready.
     *
     * @private
     */
    bindFeatureModel: function() {
        var me = this;
        // detect a layer from the store if not passed in
        if (!me.layer || !(me.layer instanceof ol.layer.Vector)) {
            var store = me.getStore();
            if (store && store.getLayer && store.getLayer() && store.getLayer() instanceof ol.layer.Vector) {
                me.layer = store.getLayer();
            }
        }
        // bind several OL events since this is not called while destroying
        me.bindOlEvents();
    },
    /**
     * Binds several events on the OL objects used in this class.
     *
     * @private
     */
    bindOlEvents: function() {
        if (!this.bound_) {
            var me = this;
            me.selectedFeatures = new ol.Collection();
            // change style of selected feature
            me.selectedFeatures.on('add', me.onSelectFeatAdd);
            // reset style of no more selected feature
            me.selectedFeatures.on('remove', me.onSelectFeatRemove);
            // create a map click listener for connected vector layer
            if (me.mapSelection && me.layer && me.map) {
                me.map.on('singleclick', me.onFeatureClick);
                me.mapClickRegistered = true;
            }
            this.bound_ = true;
        }
    },
    /**
     * Unbinds several events that were registered on the OL objects in this
     * class (see #bindOlEvents).
     *
     * @private
     */
    unbindOlEvents: function() {
        var me = this;
        // remove 'add' / 'remove' listener from selected feature collection
        if (me.selectedFeatures) {
            me.selectedFeatures.un('add', me.onSelectFeatAdd);
            me.selectedFeatures.un('remove', me.onSelectFeatRemove);
        }
        // remove 'singleclick' listener for connected vector layer
        if (me.mapClickRegistered) {
            me.map.un('singleclick', me.onFeatureClick);
            me.mapClickRegistered = false;
        }
    },
    /**
     * Handles 'add' event of #selectedFeatures.
     * Ensures that added feature gets the #selectStyle and preserves an
     * possibly existing feature style.
     *
     * @private
     * @param  {ol.Collection.Event} evt OL event object
     */
    onSelectFeatAdd: function(evt) {
        var me = this;
        var feat = evt.element;
        if (feat) {
            if (feat.getStyle()) {
                // we have to preserve the existing feature style
                var fid = feat.getId() || me.getRandomFid();
                me.existingFeatStyles[fid] = feat.getStyle();
                feat.setId(fid);
            }
            // apply select style
            feat.setStyle(me.selectStyle);
        }
    },
    /**
     * Handles 'remove' event of #selectedFeatures.
     * Ensures that the #selectStyle is reset on the removed feature.
     *
     * @private
     * @param  {ol.Collection.Event} evt OL event object
     */
    onSelectFeatRemove: function(evt) {
        var me = this;
        var feat = evt.element;
        if (feat) {
            var fid = feat.getId();
            if (fid && me.existingFeatStyles[fid]) {
                // restore existing feature style
                feat.setStyle(me.existingFeatStyles[fid]);
                delete me.existingFeatStyles[fid];
            } else {
                // reset feature style, so layer style gets active
                feat.setStyle();
            }
        }
    },
    /**
     * Handles the 'singleclick' event of the #map.
     * Detects if a feature of the connected #layer has been clicked and selects
     * this feature by selecting its corresponding grid row.
     *
     * @private
     * @param  {ol.MapBrowserEvent} evt OL event object
     */
    onFeatureClick: function(evt) {
        var me = this;
        var feat = me.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            }, {
                layerFilter: function(layer) {
                    return layer === me.layer;
                },
                hitTolerance: me.selectionTolerance
            });
        if (feat) {
            // select clicked feature in grid
            me.selectMapFeature(feat);
        }
    },
    /**
     * Selects / deselects a feature by triggering the corresponding actions in
     * the grid (e.g. selecting / deselecting a grid row).
     *
     * @private
     * @param  {ol.Feature} feature The feature to select
     */
    selectMapFeature: function(feature) {
        var me = this;
        var row = me.store.findBy(function(record, id) {
                return record.getFeature() == feature;
            });
        // deselect all if only one can be selected at a time
        if (me.getSelectionMode() === 'SINGLE') {
            me.deselectAll();
        }
        if (feature.get(me.selectedFeatureAttr)) {
            // deselect feature by deselecting grid row
            me.deselect(row);
        } else {
            // select the feature by selecting grid row
            if (row != -1 && !me.isSelected(row)) {
                me.select(row, !this.singleSelect);
                // focus the row in the grid to ensure it is visible
                me.view.focusRow(row);
            }
        }
    },
    /**
     * Is called before the onSelectChange function of the parent class.
     * Ensures that the selected feature is added / removed to / from
     * #selectedFeatures lookup object.
     *
     * @private
     * @param  {GeoExt.data.model.Feature} record Selected / deselected record
     * @param  {Boolean} isSelected Record is selected or deselected
     */
    beforeSelectChange: function(record, isSelected) {
        var me = this;
        var selFeature = record.getFeature();
        // toggle feature's selection state
        selFeature.set(me.selectedFeatureAttr, isSelected);
        if (isSelected) {
            me.selectedFeatures.push(selFeature);
        } else {
            me.selectedFeatures.remove(selFeature);
        }
    },
    /**
     * Returns a random feature ID.
     *
     * @private
     * @return {String} Random feature ID
     */
    getRandomFid: function() {
        // current timestamp plus a random int between 0 and 10
        return new Date().getTime() + '' + Math.floor(Math.random() * 11);
    }
});

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
 * A checkbox selection model which enables automatic selection of features
 * in the map when rows are selected in the grid and vice-versa.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.selection.FeatureCheckboxModel
 */
Ext.define('GeoExt.selection.FeatureCheckboxModel', {
    extend: 'Ext.selection.CheckboxModel',
    alias: [
        'selection.featurecheckboxmodel'
    ],
    mixins: [
        'GeoExt.selection.FeatureModelMixin'
    ]
});

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
 * A row selection model which enables automatic selection of features
 * in the map when rows are selected in the grid and vice-versa.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.selection.FeatureModel
 */
Ext.define('GeoExt.selection.FeatureRowModel', {
    // for backwards compatibility
    alternateClassName: 'GeoExt.selection.FeatureModel',
    extend: 'Ext.selection.RowModel',
    alias: [
        'selection.featuremodel',
        // for backwards compatibility
        'selection.featurerowmodel'
    ],
    mixins: [
        'GeoExt.selection.FeatureModelMixin'
    ]
});

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
 * The permalink provider.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * Sample code displaying a new permalink each time the map is moved:
 *
 *     @example preview
 *     // create permalink provider
 *     var permalinkProvider = Ext.create('GeoExt.state.PermalinkProvider', {});
 *     // set it in the state manager
 *     Ext.state.Manager.setProvider(permalinkProvider);
 *
 *     // create a map panel, and make it stateful
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         stateful: true,
 *         stateId: 'gx_mapstate',
 *         map: new ol.Map({
 *             layers: [
 *                 new ol.layer.Tile({
 *                     source: new ol.source.OSM()
 *                 })
 *             ],
 *             view: new ol.View({
 *                 center: ol.proj.fromLonLat([-8.751278, 40.611368]),
 *                 zoom: 12
 *             })
 *         })
 *     });
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'GeoExt.component.Map Example',
 *         height: 200,
 *         items: [mapComponent],
 *         renderTo: Ext.getBody()
 *     });
 *     // display permalink hash each time state is changed
 *     permalinkProvider.on({
 *         statechange: function(provider, name, value) {
 *             alert(provider.getPermalinkHash());
 *         }
 *     });
 *
 * @class GeoExt.state.PermalinkProvider
 */
Ext.define('GeoExt.state.PermalinkProvider', {
    extend: 'Ext.state.Provider',
    requires: [],
    alias: 'state.gx_permalinkprovider',
    /**
     * Current map state object.
     *
     * @property {Object}
     * @private
     */
    mapState: null,
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        if (window.location.hash !== '') {
            me.mapState = me.readPermalinkHash(window.location.hash);
        }
    },
    /**
     * Create a state object from a URL hash.
     * The hash to be in the form `#map=12/-1035528.44/7073659.19/0`
     *
     * @param {String} plHash The URL hash to get the state from
     * @return {Object} The state object
     * @private
     */
    readPermalinkHash: function(plHash) {
        var mapState;
        // try to restore center, zoom-level and rotation from the URL
        var hash = plHash.replace('#map=', '');
        var parts = hash.split('/');
        if (parts.length === 4) {
            mapState = {
                zoom: parseInt(parts[0], 10),
                center: [
                    parseFloat(parts[1]),
                    parseFloat(parts[2])
                ],
                rotation: parseFloat(parts[3])
            };
        }
        return mapState;
    },
    /**
     * Returns the URL hash part with current zoom-level, center and rotation
     * corresponding to the current state.
     *
     * @param {Boolean} doRound Flag if coords should be rounded to 2
     *     digits or not
     * @return {String} The hash part of the permalink
     */
    getPermalinkHash: function(doRound) {
        var me = this;
        var mapState = me.mapState;
        var centerX = mapState.center[0];
        var centerY = mapState.center[1];
        if (doRound) {
            centerX = Math.round(centerX * 100) / 100;
            centerY = Math.round(centerY * 100) / 100;
        }
        var hash = '#map=' + mapState.zoom + '/' + centerX + '/' + centerY + '/' + mapState.rotation;
        return hash;
    },
    /**
     * Sets the value for a key.
     *
     * @param {String} name The key name
     * @param {Object} value The value to set
     */
    set: function(name, value) {
        var me = this;
        // keep our mapState object in sync with the state
        me.mapState = value;
        // call 'set' of super class
        me.callParent(arguments);
    }
});

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
 * A paging toolbar which can be used in combination with a OGC WFS by using
 * the `GeoExt.data.store.WfsFeatures` class.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.toolbar.WfsPaging
 */
Ext.define('GeoExt.toolbar.WfsPaging', {
    extend: 'Ext.toolbar.Paging',
    xtype: 'gx_wfspaging_toolbar',
    /**
     * Ensures that the 'gx-wfsstoreload' event of the WFS store is bound to the
     * onLoad function of this toolbar once we have the store bound.
     */
    onBindStore: function() {
        var me = this;
        me.callParent(arguments);
        me.store.on('gx-wfsstoreload', me.onLoad, me);
    }
});

