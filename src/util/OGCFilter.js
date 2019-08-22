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
        wfs100GetFeatureXmlTpl:
            '<wfs:GetFeature service="WFS" version="1.0.0"' +
                ' outputFormat="JSON"' +
                ' xmlns:wfs="http://www.opengis.net/wfs"' +
                ' xmlns="http://www.opengis.net/ogc"' +
                ' xmlns:gml="http://www.opengis.net/gml"' +
                ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                ' xsi:schemaLocation="http://www.opengis.net/wfs' +
                ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">' +
                '<wfs:Query typeName="{0}">{1}' +
                '</wfs:Query>' +
            '</wfs:GetFeature>',

        /**
         * The WFS 1.1.0 GetFeature XML body template
         */
        wfs110GetFeatureXmlTpl:
            '<wfs:GetFeature service="WFS" version="1.1.0"' +
                ' outputFormat="JSON"' +
                ' xmlns:wfs="http://www.opengis.net/wfs"' +
                ' xmlns="http://www.opengis.net/ogc"' +
                ' xmlns:gml="http://www.opengis.net/gml"' +
                ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                ' xsi:schemaLocation="http://www.opengis.net/wfs' +
                ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">' +
                '<wfs:Query typeName="{0}">{1}' +
                '</wfs:Query>' +
            '</wfs:GetFeature>',

        /**
         * The WFS 2.0.0 GetFeature XML body template
         */
        wfs200GetFeatureXmlTpl:
            '<wfs:GetFeature service="WFS" version="2.0.0" ' +
                'xmlns:wfs="http://www.opengis.net/wfs/2.0" ' +
                'xmlns:fes="http://www.opengis.net/fes/2.0" ' +
                'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
                'xmlns:sf="http://www.openplans.org/spearfish" ' +
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                'xsi:schemaLocation="http://www.opengis.net/wfs/2.0 ' +
                'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' +
                'http://www.opengis.net/gml/3.2 ' +
                'http://schemas.opengis.net/gml/3.2.1/gml.xsd">' +
                '<wfs:Query typeName="{0}">{1}' +
                '</wfs:Query>' +
            '</wfs:GetFeature>',

        /**
         * The template for spatial filters used in WFS 1.x.0 queries
         */
        spatialFilterWfs1xXmlTpl: '<{0}>' +
            '<PropertyName>{1}</PropertyName>' +
            '{2}' +
            '</{0}>',

        /**
         * The template for spatial filters used in WFS 2.0.0 queries
         */
        spatialFilterWfs2xXmlTpl: '<{0}>' +
            '<ValueReference>{1}</ValueReference>' +
            '{2}' +
            '</{0}>',

        /**
         * The template for spatial bbox filters used in WFS 1.x.0 queries
         */
        spatialFilterBBoxTpl: '<BBOX>' +
        '    <PropertyName>{0}</PropertyName>' +
        '    <gml:Envelope' +
        '        xmlns:gml="http://www.opengis.net/gml" srsName="{1}">' +
        '        <gml:lowerCorner>{2} {3}</gml:lowerCorner>' +
        '        <gml:upperCorner>{4} {5}</gml:upperCorner>' +
        '    </gml:Envelope>' +
        '</BBOX>',

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
            return GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(
                filters, 'wms', combinator);
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
        getOgcWfsFilterFromExtJsFilter: function(filters, combinator,
            wfsVersion) {
            return GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(
                filters, 'wfs', combinator, wfsVersion);
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
        getOgcFilterFromExtJsFilter: function(filters, type, combinator,
            wfsVersion) {
            if (!Ext.isDefined(filters) || !Ext.isArray(filters)) {
                Ext.Logger.error('Invalid filter argument given to ' +
                  'GeoExt.util.OGCFilter. You need to pass an array of ' +
                  '"Ext.util.Filter"');
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
                filterBody = ogcUtil.getOgcFilterBodyFromExtJsFilterObject(
                    filter, wfsVersion);
                if (filterBody) {
                    ogcFilters.push(filterBody);
                }
            });
            return ogcUtil.combineFilters(
                ogcFilters, combinator, omitNamespaces, wfsVersion);
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
                Ext.Logger.error('Invalid filter argument given to ' +
                    'GeoExt.util.OGCFilter. You need to pass an instance of ' +
                    '"Ext.util.Filter"');
                return;
            }

            var property = filter.getProperty();
            var operator = filter.getOperator();
            var value = filter.getValue();
            var srsName;
            if (filter.type === 'spatial') {
                srsName = filter.srsName;
            }

            if (Ext.isEmpty(property) || Ext.isEmpty(operator) ||
                Ext.isEmpty(value)) {
                Ext.Logger.warn('Skipping a filter as some values ' +
                    'seem to be undefined');
                return;
            }

            if (filter.isDateValue) {
                if (filter.getDateFormat) {
                    value = Ext.Date.format(
                        filter.getValue(),
                        filter.getDateFormat()
                    );
                } else {
                    value = Ext.Date.format(filter.getValue(), 'Y-m-d');
                }
            }

            return GeoExt.util.OGCFilter.getOgcFilter(
                property, operator, value, wfsVersion, srsName);
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
        buildWfsGetFeatureWithFilter: function(filters, combinator, wfsVersion,
            typeName) {
            var filter = GeoExt.util.OGCFilter.getOgcWfsFilterFromExtJsFilter(
                filters, combinator, wfsVersion);
            var tpl = GeoExt.util.OGCFilter.wfs100GetFeatureXmlTpl;
            if (wfsVersion && wfsVersion === '1.1.0') {
                tpl =  GeoExt.util.OGCFilter.wfs110GetFeatureXmlTpl;
            } else if (wfsVersion && wfsVersion === '2.0.0') {
                tpl =  GeoExt.util.OGCFilter.wfs200GetFeatureXmlTpl;
            }
            return Ext.String.format(
                tpl,
                typeName,
                filter
            );
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
            if (Ext.isEmpty(property) || Ext.isEmpty(operator) ||
                Ext.isEmpty(value)) {
                Ext.Logger.error('Invalid argument given to method ' +
                    '`getOgcFilter`. You need to supply property, ' +
                    'operator and value.');
                return;
            }
            var ogcFilterType;
            var closingTag;
            var propName = 'PropertyName';
            if (!Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0') {
                propName = 'ValueReference';
            }

            // always replace surrounding quotes
            if (!(value instanceof ol.geom.Geometry)) {
                value = value.toString().replace(/(^['])/g, '');
                value = value.toString().replace(/([']$)/g, '');
            }

            switch (operator) {
            case '==':
                ogcFilterType = 'PropertyIsEqualTo';
                break;
            case 'eq':
                ogcFilterType = 'PropertyIsEqualTo';
                break;
            case '!==':
                ogcFilterType = 'PropertyIsNotEqualTo';
                break;
            case 'ne':
                ogcFilterType = 'PropertyIsNotEqualTo';
                break;
            case 'lt':
                ogcFilterType = 'PropertyIsLessThan';
                break;
            case 'lte':
                ogcFilterType = 'PropertyIsLessThanOrEqualTo';
                break;
            case 'gt':
                ogcFilterType = 'PropertyIsGreaterThan';
                break;
            case 'gte':
                ogcFilterType = 'PropertyIsGreaterThanOrEqualTo';
                break;
            case 'like':
                value = '*' + value + '*';
                var likeFilter =
                  '<PropertyIsLike wildCard="*" singleChar="."' +
                    ' escape="!" matchCase="false">' +
                    '<' + propName + '>' + property + '</' + propName + '>' +
                    '<Literal>' + value + '</Literal>' +
                  '</PropertyIsLike>';
                return likeFilter;
            case 'in':
                ogcFilterType = 'Or';
                var values = value;
                if (!Ext.isArray(value)) {
                    // cleanup brackets and quotes
                    value = value.replace(/([()'])/g, '');
                    values = value.split(',');
                }
                var filters = '';
                Ext.each(values || value, function(val) {
                    filters +=
                    '<PropertyIsEqualTo>' +
                      '<' + propName + '>' + property + '</' + propName + '>' +
                      '<Literal>' + val + '</Literal>' +
                    '</PropertyIsEqualTo>';
                });
                ogcFilterType = '<' + ogcFilterType + '>';

                var inFilter;
                closingTag = Ext.String.insert(ogcFilterType, '/', 1);
                // only use an Or filter when there are multiple values
                if (values.length > 1) {
                    inFilter = ogcFilterType + filters + closingTag;
                } else {
                    inFilter = filters;
                }
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
                    Ext.Logger.warn('Method `getOgcFilter` could not ' +
                        'handle the given topological operator: ' +
                        operator);
                    return;
                }
                var gmlElement = GeoExt.util.OGCFilter
                    .getGmlElementForGeometry(value, srsName, wfsVersion);

                var spatialTpl = wfsVersion !== '2.0.0' ?
                    GeoExt.util.OGCFilter.spatialFilterWfs1xXmlTpl :
                    GeoExt.util.OGCFilter.spatialFilterWfs2xXmlTpl;

                return Ext.String.format(
                    spatialTpl,
                    ogcFilterType,
                    property,
                    gmlElement
                );
            case 'bbox':
                var llx; var lly; var urx; var ury;
                value = value.getExtent();
                llx = value[0];
                lly = value[1];
                urx = value[2];
                ury = value[3];

                return Ext.String.format(
                    GeoExt.util.OGCFilter.spatialFilterBBoxTpl,
                    property,
                    srsName,
                    llx,
                    lly,
                    urx,
                    ury
                );
            default:
                Ext.Logger.warn('Method `getOgcFilter` could not ' +
                    'handle the given operator: ' + operator);
                return;
            }
            ogcFilterType = '<' + ogcFilterType + '>';
            closingTag = Ext.String.insert(ogcFilterType, '/', 1);
            var tpl = '' +
                '{0}' +
                  '<' + propName + '>{1}</' + propName + '>' +
                  '<Literal>{2}</Literal>' +
                '{3}';

            var filter = Ext.String.format(
                tpl,
                ogcFilterType,
                property,
                value,
                closingTag
            );
            return filter;
        },

        /**
         * Returns a serialized geometry in GML3 format
         * @param {ol.geometry.Geometry} geometry The geometry to serialize
         * @param {String} srsName The epsg code to use to serialization
         * @return {string} The serialized geometry in GML3 format
         */
        getGmlElementForGeometry: function(geometry, srsName) {
            var format = new  ol.format.GML3({
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
            var serializedValue = serializer
                .serializeToString(childNodes[0]);
            return serializedValue;
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
        combineFilters: function(filters, combinator, omitNamespaces,
            wfsVersion) {
            var defaultCombineWith = 'And';
            var combineWith = combinator || defaultCombineWith;
            var numFilters = filters.length;
            var parts = [];
            var ns = omitNamespaces ? '' : 'ogc';
            if (!Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0') {
                ns = 'fes/2.0';
            }
            parts.push('<Filter' + (omitNamespaces ? '' :
                ' xmlns="http://www.opengis.net/' + ns + '"' +
                ' xmlns:gml="http://www.opengis.net/gml"') + '>');

            if (numFilters > 1) {
                parts.push('<' + combineWith + '>');
            }

            Ext.each(filters, function(filter) {
                parts.push(filter);
            });

            if (numFilters > 1) {
                parts.push('</' + combineWith + '>');
            }

            parts.push('</' + 'Filter>');
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
            if (!Ext.Array.contains(GeoExt.util.OGCFilter.
                topologicalOrSpatialFilterOperators, operator)) {
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
