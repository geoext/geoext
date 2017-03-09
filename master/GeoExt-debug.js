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
    statics: {
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
        // will be filled while we are checking stuff for existance
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
    statics: {
        /**
         * Determines the style for the given feature record.
         *
         * @param {GeoExt.data.model.Feature} record A feature record to get the
         *     styler for.
         * @return {ol.style.Style[]|ol.style.Style} The style(s) applied to the
         *     given feature record.
         * @public
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
        me.map.getView().fit(bounds, me.map.getSize());
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
     * @param  {object} defaultValue The optional default value.
     * @return {object}              The returned property.
     */
    getOlLayerProp: function(prop, defaultValue) {
        var layer = this.getOlLayer();
        var value = (layer ? layer.get(prop) : undefined);
        return (value !== undefined ? value : defaultValue);
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
 * A store that synchronizes a layers array of an OpenLayers.Map with a
 * layer store holding GeoExt.data.model.layer.Base instances.
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
         * A configured map or a configuration object for the map constructor.
         *
         * @cfg {ol.Map/Object} map
         */
        map: null
    },
    /**
     * Constructs an instance of the layer store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        var me = this;
        me.callParent([
            config
        ]);
        if (config.map) {
            this.bindMap(config.map);
        }
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
            mapLayers.forEach(function(layer) {
                me.loadRawData(layer, true);
            });
            mapLayers.forEach(function(layer) {
                layer.on('propertychange', me.onChangeLayer, me);
            });
            mapLayers.on('add', me.onAddLayer, me);
            mapLayers.on('remove', me.onRemoveLayer, me);
        }
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
     * Unbind this store from the map it is currently bound.
     */
    unbindMap: function() {
        var me = this;
        if (me.map && me.map.getLayers()) {
            me.map.getLayers().un('add', me.onAddLayer, me);
            me.map.getLayers().un('remove', me.onRemoveLayer, me);
        }
        me.un('load', me.onLoad, me);
        me.un('clear', me.onClear, me);
        me.un('add', me.onAdd, me);
        me.un('remove', me.onRemove, me);
        me.un('update', me.onStoreUpdate, me);
        me.data.un('replace', me.onReplace, me);
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
        var recordIndex = this.findBy(function(rec) {
                return rec.getOlLayer() === layer;
            });
        if (recordIndex > -1) {
            var record = this.getAt(recordIndex);
            if (evt.key === 'title') {
                record.set('title', layer.get('title'));
            } else {
                this.fireEvent('update', this, record, Ext.data.Record.EDIT);
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
        var index = this.map.getLayers().getArray().indexOf(layer);
        var me = this;
        layer.on('propertychange', me.onChangeLayer, me);
        if (!me._adding) {
            me._adding = true;
            var result = me.proxy.reader.read(layer);
            me.insert(index, result.records);
            delete me._adding;
        }
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
                layer.un('propertychange', me.onChangeLayer, me);
                me.remove(rec);
                delete me._removing;
            }
        }
    },
    /**
     * Handler for a store's `load` event.
     *
     * @param {Ext.data.Store} store The store that loaded.
     * @param {Ext.data.Model[]} records An array of loades model instances.
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
                me.map.getLayers().forEach(function(layer) {
                    layer.un('propertychange', me.onChangeLayer, me);
                });
                me.map.getLayers().clear();
                delete me._removing;
            }
            var len = records.length;
            if (len > 0) {
                var layers = new Array(len);
                for (var i = 0; i < len; i++) {
                    layers[i] = records[i].getOlLayer();
                    layers[i].on('propertychange', me.onChangeLayer, me);
                }
                me._adding = true;
                me.map.getLayers().extend(layers);
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
        me.map.getLayers().forEach(function(layer) {
            layer.un('propertychange', me.onChangeLayer, me);
        });
        me.map.getLayers().clear();
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
                layer.on('propertychange', me.onChangeLayer, me);
                if (index === 0) {
                    me.map.getLayers().push(layer);
                } else {
                    me.map.getLayers().insertAt(index, layer);
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
                layer.un('propertychange', me.onChangeLayer, me);
                me.map.getLayers().forEach(compareFunc);
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
     * @param {Ext.data.Model} record The model instance that was updated.
     * @param {String} operation The operation, either Ext.data.Model.EDIT,
     *     Ext.data.Model.REJECT or Ext.data.Model.COMMIT.
     */
    onStoreUpdate: function(store, record, operation) {
        if (operation === Ext.data.Record.EDIT) {
            if (record.modified && record.modified.title) {
                var layer = record.getOlLayer();
                var title = record.get('title');
                if (title !== layer.get('title')) {
                    layer.set('title', title);
                }
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
        this.map.getLayers().remove(record.getOlLayer());
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
     * @return {Ext.data.Model} The corresponding model instance or undefined if
     *     not found.
     */
    getByLayer: function(layer) {
        var index = this.findBy(function(r) {
                return r.getOlLayer() === layer;
            });
        if (index > -1) {
            return this.getAt(index);
        }
    },
    /**
     * Unbinds listeners by calling #unbind prior to being destroyed.
     *
     * @private
     */
    destroy: function() {
        this.unbind();
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
 * A component that renders an `ol.Map` and that can be used in any ExtJS
 * layout.
 *
 * An example: A map component rendered insiide of a panel:
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
        'GeoExt.data.store.Layers'
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
        pointerRestPixelTolerance: 3
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
        this.getView().fit(extent, this.getMap().getSize());
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
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],
    symbols: [
        'ol.animation.pan',
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
        'ol.Map#beforeRender',
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
    statics: {
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
         * An `ol.Collection` of `ol.layer.Base`. If not defined on
         * construction, the layers of the #parentMap will be used.
         *
         * @cfg {ol.Collection}
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
        var parentLayers;
        if (me.getLayers().length < 1) {
            parentLayers = me.getParentMap().getLayers();
            parentLayers.forEach(function(layer) {
                if (layer instanceof ol.layer.Tile || layer instanceof ol.layer.Image) {
                    me.getLayers().push(layer);
                }
            });
        }
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
        Ext.each(me.getLayers(), function(layer) {
            me.getMap().addLayer(layer);
        });
        // Set the OverviewMaps center or resolution, on property changed
        // in parentMap.
        parentMap.getView().on('propertychange', me.onParentViewPropChange, me);
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
        dragInteraction.on('translatestart', me.disableBoxUpdate, me);
        dragInteraction.on('translating', me.repositionAnchorFeature, me);
        dragInteraction.on('translateend', me.recenterParentFromBox, me);
        dragInteraction.on('translateend', me.enableBoxUpdate, me);
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
            parentMap.on('postrender', me.updateBox, me);
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
        me.getMap().removeInteraction(dragInteraction);
        dragInteraction.un('translatestart', me.disableBoxUpdate, me);
        dragInteraction.un('translating', me.repositionAnchorFeature, me);
        dragInteraction.un('translateend', me.recenterParentFromBox, me);
        dragInteraction.un('translateend', me.enableBoxUpdate, me);
        dragInteraction.setActive(false);
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
        var panAnimation = ol.animation.pan({
                duration: me.getRecenterDuration(),
                source: currentMapCenter
            });
        var boxExtent = me.boxFeature.getGeometry().getExtent();
        var boxCenter = ol.extent.getCenter(boxExtent);
        parentMap.beforeRender(panAnimation);
        // transform if necessary
        if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
            boxCenter = ol.proj.transform(boxCenter, overviewProjection, parentProjection);
        }
        parentView.setCenter(boxCenter);
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
        var panAnimation = ol.animation.pan({
                duration: me.getRecenterDuration(),
                source: currentMapCenter
            });
        var newCenter = evt.coordinate;
        // transform if necessary
        if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
            newCenter = ol.proj.transform(newCenter, overviewProjection, parentProjection);
        }
        parentMap.beforeRender(panAnimation);
        parentView.setCenter(newCenter);
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
                overviewView.fit(parentExtentProjected, me.getMap().getSize(), {
                    constrainResolution: false
                });
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
            map.on('click', me.overviewMapClicked, me);
        } else {
            map.un('click', me.overviewMapClicked, me);
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
        overlay.on('change:position', me.updateLayout, me);
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
        me.getOverlay().un('change:position', me.doLayout, me);
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
        'Ext.data.JsonStore'
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
        url: ''
    },
    statics: {
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
         * @return {Array<Object>} An array of serialized layers.
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
                    serialized = serializer.serialize(layer, source, viewRes);
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
     * and contans the PrintCapabilities of the Printprovider.
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
                this.fireEvent('ready', this);
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
            store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                model: 'GeoExt.data.model.print.Capability',
                proxy: {
                    type: 'jsonp',
                    url: url,
                    callbackKey: 'jsonp'
                },
                listeners: {
                    load: fillRecordAndFireEvent,
                    scope: this
                }
            });
        }
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
    statics: {
        /**
         * Gets a reference to an ol contructor function.
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
        me.olObject.on('propertychange', me.onPropertychange, me);
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
     * Overriden to foward changes to the underlying `ol.Object`. All changes on
     * the Ext.data.Models properties will be set on the `ol.Object` as well.
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
            this.olObject.set(k, v);
        }, this);
        this.__updating = false;
    },
    /**
     * Overriden to unregister all added event listeners on the ol.Object.
     *
     * @inheritdoc
     */
    destroy: function() {
        this.olObject.un('propertychange', this.onPropertychange, this);
        this.callParent(arguments);
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
            layer.on('change:visible', this.onLayerVisibleChange, this);
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
     * Overriden to forward changes to the underlying `ol.Object`. All changes
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
            Ext.raise('This method must be overriden by subclasses.');
            return null;
        },
        // so that we can have a shared JSDoc comment.
        /**
         * Given a subclass of GeoExt.data.serializer.Base, register the class
         * with the GeoExt.data.MapfishPrintProvider. This method is ususally
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
            var stylesArray = styles ? styles.split(',') : [
                    ''
                ];
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
            var stylesArray = styles ? styles.split(',') : [
                    ''
                ];
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
        serialize: function(layer, source, viewRes) {
            var me = this;
            me.validateSource(source);
            var features = source.getFeatures();
            var format = me.format;
            var geoJsonFeatures = [];
            var mapfishStyleObject = {
                    version: 2
                };
            Ext.each(features, function(feature) {
                var geometry = feature.getGeometry();
                if (Ext.isEmpty(geometry)) {
                    // no need to encode features with no geometry
                    return;
                }
                var geometryType = geometry.getType();
                var geojsonFeature = format.writeFeatureObject(feature);
                var styles = null;
                var styleFunction = feature.getStyleFunction();
                if (Ext.isDefined(styleFunction)) {
                    styles = styleFunction.call(feature, viewRes);
                } else {
                    styleFunction = layer.getStyleFunction();
                    if (Ext.isDefined(styleFunction)) {
                        styles = styleFunction.call(layer, feature, viewRes);
                    }
                }
                if (styles !== null && styles.length > 0) {
                    geoJsonFeatures.push(geojsonFeature);
                    if (Ext.isEmpty(geojsonFeature.properties)) {
                        geojsonFeature.properties = {};
                    }
                    Ext.each(styles, function(style, j) {
                        var styleId = me.getUid(style);
                        var featureStyleProp = me.FEAT_STYLE_PREFIX + j;
                        me.encodeVectorStyle(mapfishStyleObject, geometryType, style, styleId, featureStyleProp);
                        geojsonFeature.properties[featureStyleProp] = styleId;
                    });
                }
            });
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
                    symbolizer = {
                        type: 'point',
                        externalGraphic: src
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
         * @return {String} The uid of the object.
         * @private
         */
        getUid: function(obj) {
            if (!Ext.isObject(obj)) {
                Ext.raise('Cannot get uid of non-object.');
            }
            var key = this.GX_UID_PROPERTY;
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
         * @inheritdoc
         */
        add: function(store, records, index) {
            var coll = store.olCollection;
            var length = records.length;
            var i;
            store.__updating = true;
            for (i = 0; i < length; i++) {
                coll.insertAt(index + i, records[i].olObject);
            }
            store.__updating = false;
        },
        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @inheritdoc
         */
        remove: function(store, records, index) {
            var coll = store.olCollection;
            var length = records.length;
            var i;
            store.__updating = true;
            for (i = 0; i < length; i++) {
                coll.removeAt(index);
            }
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
        this.olCollection.on('add', this.onOlCollectionAdd, this);
        this.olCollection.on('remove', this.onOlCollectionRemove, this);
    },
    /**
     * Forwards changes to the `ol.Collection` to the Ext.data.Store.
     *
     * @param {ol.CollectionEvent} evt The event emitted by the `ol.Collection`.
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
    /**
     * @inheritdoc
     */
    destroy: function() {
        this.olCollection.un('add', this.onCollectionAdd, this);
        this.olCollection.un('remove', this.onCollectionRemove, this);
        delete this.olCollection;
        this.callParent(arguments);
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
         * @cfg {ol.Layer} layer
         */
        /**
         * The layer object which is in sync with this store.
         * @property {ol.Layer}
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
     * Setting this flag to true will create a vector #layer with the given
     * #features and adds it to the given #map (if available).
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
     * Constructs the feature store.
     *
     * @param {Object} config The configuration object.
     */
    constructor: function(config) {
        var me = this;
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
        if (cfg.features) {
            cfg.data = cfg.features;
        } else if (cfg.layer && cfg.layer instanceof ol.layer.Vector) {
            if (cfg.layer.getSource()) {
                cfg.data = cfg.layer.getSource().getFeatures();
            }
        }
        if (!cfg.data) {
            cfg.data = new ol.Collection();
        }
        me.callParent([
            cfg
        ]);
        // create a vector layer and add to map if configured accordingly
        if (me.createLayer === true && !me.layer) {
            me.drawFeaturesOnMap();
        }
        me.bindLayerEvents();
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
        var me = this;
        me.unbindLayerEvents();
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
     * Bind the 'addfeature' and 'removefeature' events to sync the features
     * in #layer with this store.
     *
     * @private
     */
    bindLayerEvents: function() {
        var me = this;
        if (me.layer && me.layer.getSource() instanceof ol.source.Vector) {
            // bind feature add / remove events of the layer
            me.layer.getSource().on('addfeature', me.onFeaturesAdded, me);
            me.layer.getSource().on('removefeature', me.onFeaturesRemoved, me);
        }
    },
    /**
     * Unbind the 'addfeature' and 'removefeature' events of the #layer.
     *
     * @private
     */
    unbindLayerEvents: function() {
        var me = this;
        if (me.layer && me.layer.getSource() instanceof ol.source.Vector) {
            // unbind feature add / remove events of the layer
            me.layer.getSource().un('addfeature', me.onFeaturesAdded, me);
            me.layer.getSource().un('removefeature', me.onFeaturesRemoved, me);
        }
    },
    /**
     * Handler for #layer 'addfeature' event.
     *
     * @param {Object} evt The event object of OpenLayers.
     * @private
     */
    onFeaturesAdded: function(evt) {
        this.add(evt.feature);
    },
    /**
     * Handler for #layer 'removefeature' event.
     *
     * @param {Object} evt The event object of OpenLayers.
     * @private
     */
    onFeaturesRemoved: function(evt) {
        var me = this;
        if (!me._removing) {
            var record = me.getByFeature(evt.feature);
            if (record) {
                me._removing = true;
                me.remove(record);
                delete me._removing;
            }
        }
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
 * A utility class for working with OpenLayers layers.
 *
 * @class GeoExt.util.Layer
 */
Ext.define('GeoExt.util.Layer', {
    statics: {
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
         * method #onBeforeGroupNodeCollapse for an explanation.
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
            removedNode.un('beforecollapse', me.onBeforeGroupNodeCollapse);
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
        if (currentLayerInGroupIdx !== insertIdx) {
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
            // See onBeforeGroupNodeCollapse for an explanation why we have this
            layerNode.on('beforecollapse', me.onBeforeGroupNodeCollapse, me);
            var childLayers = layerOrGroup.getLayers().getArray();
            Ext.each(childLayers, me.addLayerNode, me, me.inverseLayerOrder);
        }
    },
    /**
     * Bound as an eventlistener for layer nodes which are a folder / group on
     * the beforecollapse event. Whenever a folder gets collapsed, ExtJS seems
     * to actually remove the children from the store, triggering the removal
     * of the actual layers in the map. This is an undesired behviour. We handle
     * this as follows: Before the collapsing happens, we mark the childNodes,
     * so we effectively opt-out in #handleRemove.
     *
     * @param {Ext.data.NodeInterface} node The collapsible folder node.
     * @private
     */
    onBeforeGroupNodeCollapse: function(node) {
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
            collection.on('remove', me.onLayerCollectionRemove, me);
            collection.on('add', me.onLayerCollectionAdd, me);
            collection.forEach(me.bindGroupLayerCollectionEvents, me);
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
            collection.un('remove', me.onLayerCollectionRemove, me);
            collection.un('add', me.onLayerCollectionAdd, me);
            collection.forEach(me.unbindGroupLayerCollectionEvents, me);
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

