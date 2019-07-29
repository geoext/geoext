/* Copyright (c) 2015-2019 The Open Source Geospatial Foundation
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
        'GeoExt.mixin.SymbolCheck'
    ],

    /**
     * Default to using server side sorting
     * @cfg {Boolean}
     */
    remoteSort: true,

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
     * The 'outputFormat' param value used in the WFS request.
     * @cfg {String}
     */
    outputFormat: 'application/json',

    /**
     * The 'sortBy' param value used in the WFS request.
     * @cfg {String}
     */
    sortBy: null,

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
     * Additional OpenLayers properties to apply to the created vector layer source. Only has an
     * effect if #createLayer is set to `true`
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
            var currentPage = Math.floor(startIndex / config.pageSize) + 1;
            config.currentPage = currentPage;
        }

        // avoid creation of vector layer by parent class (raises error when
        // applying WFS data) so we can create the WFS vector layer on our own
        // (if needed)
        var createLayer = config.createLayer;
        config.createLayer = false;

        me.callParent([config]);

        if (!me.url) {
            Ext.raise('No URL given to WfsFeaturesStore');
        }

        if (createLayer) {
            // the WFS vector layer showing the WFS features on the map
            me.source = new ol.source.Vector({
                features: [],
                attributions: me.layerAttribution
            });

            var layerOptions = {
                source: me.source,
                style: me.style
            }

            if (me.layerOptions) {
                Ext.applyIf(layerOptions, me.layerOptions);
            }

            me.layer = new ol.layer.Vector(layerOptions);

            me.layerCreated = true;
        }

        if (me.cacheFeatureCount === true) {
            me.cacheTotalFeatureCount();
        } else {
            // initial load of the WFS data
            me.loadWfs();
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
            Ext.Logger.warn('Error while detecting total feature count from ' +
                'WFS response');
        }

        return totalCount;
    },

    /**
     * Gets the number of features for the WFS typeName
     * using resultType=hits and caches it so it only needs to be calculated
     * the first time the store is used.
     * @private
     */
    cacheTotalFeatureCount: function() {

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
            method: 'GET',
            params: params,
            success: function(response) {
                // set number of total features (needed for paging)
                me.cachedTotalCount = me.getTotalFeatureCount(response);
                me.loadWfs();
            },
            failure: function(response) {
                Ext.Logger.warn('Error while requesting features from WFS: ' +
                    response.responseText + ' Status: ' + response.status);
            }
        });
    },

    /**
     * Loads the data from the connected WFS.
     * @private
     */
    loadWfs: function() {
        var me = this;
        var url = me.url;
        var params = {
            service: me.service,
            version: me.version,
            request: me.request,
            typeName: me.typeName,
            outputFormat: me.outputFormat
        };

        // send the sortBy parameter only when remoteSort is true
        // as it is not supported by all WFS servers
        if (me.remoteSort === true) {
            params.sortBy = me.sortBy;
        }

        // apply paging parameters if necessary
        if (me.pageSize) {
            var fromRecord =
                ((me.currentPage - 1) * me.pageSize) + me.startIndexOffset;
            me.startIndex = fromRecord;
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
            method: 'GET',
            params: params,
            success: function(response) {

                if (!me.format) {
                    Ext.Logger.warn('No format given for WfsFeatureStore. ' +
                        'Skip parsing feature data.');
                    return;
                }

                if (me.cacheFeatureCount === true) {
                    // me.totalCount is reset to 0 on each load so reset it here
                    me.totalCount = me.cachedTotalCount;
                } else {
                    // set number of total features (needed for paging)
                    me.totalCount = me.getTotalFeatureCount(response);
                }

                // parse WFS response to OL features
                var wfsFeats = me.format.readFeatures(response.responseText);

                // set data for store
                me.setData(wfsFeats);

                if (me.layer) {
                    // add features to WFS layer
                    me.source.clear();
                    me.source.addFeatures(wfsFeats);
                }

                me.fireEvent('gx-wfsstoreload', me, wfsFeats, true);
            },
            failure: function(response) {
                Ext.Logger.warn('Error while requesting features from WFS: ' +
                    response.responseText + ' Status: ' + response.status);
                me.fireEvent('gx-wfsstoreload', me, null, false);
            }

        });
    }
});
