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

    // <debug>
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
    // </debug>

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
        GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE: {}, // filled once class is defined

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
                    symbolizers: [{
                        type: 'point',
                        strokeColor: 'white',
                        strokeOpacity: 1,
                        strokeWidth: 4,
                        strokeDashstyle: 'solid',
                        fillColor: 'red'
                    }]
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
                if (geojsonFeature.properties &&
                        geojsonFeature.properties.parentFeature) {
                    geojsonFeature.properties.parentFeature = undefined;
                }

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

                if (!Ext.isArray(styles)) {
                    styles = [styles];
                }
                if (!Ext.isEmpty(styles)) {
                    geoJsonFeatures.push(geojsonFeature);
                    if (Ext.isEmpty(geojsonFeature.properties)) {
                        geojsonFeature.properties = {};
                    }
                    Ext.each(styles, function(style, j) {
                        var styleId = me.getUid(style, geometryType);
                        var featureStyleProp = me.FEAT_STYLE_PREFIX + j;
                        me.encodeVectorStyle(
                            mapfishStyleObject,
                            geometryType,
                            style,
                            styleId,
                            featureStyleProp
                        );
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
        encodeVectorStyle:
            function(object, geometryType, style, styleId, featureStyleProp) {
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
                    me.encodeVectorStylePolygon(
                        styleObject.symbolizers, fillStyle, strokeStyle
                    );
                } else if (styleType === LINETYPE && hasStrokeStyle) {
                    me.encodeVectorStyleLine(
                        styleObject.symbolizers, strokeStyle
                    );
                } else if (styleType === POINTTYPE && hasImageStyle) {
                    me.encodeVectorStylePoint(
                        styleObject.symbolizers, imageStyle
                    );
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
        encodeVectorStylePolygon: function(symbolizers, fillStyle,
            strokeStyle) {
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
            if (isNaN(r) || r < 0 || r > 255 ||
                isNaN(g) || g < 0 || g > 255 ||
                isNaN(b) || b < 0 || b > 255) {
                Ext.raise('"(' + r + ',' + g + ',' + b + '") is not a valid ' +
                    ' RGB color');
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
