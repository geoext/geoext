/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * Create a component container for a map.
 *
 * Example:
 *
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         width: 800,
 *         height: 600,
 *         map: new ol.Map({
 *             layers: [layer],
 *             view: new ol.View({
 *                 center: [0, 0],
 *                 zoom: 2
 *             })
 *         }),
 *         renderTo: 'mapDiv' // ID of the target <div>. Optional.
 *     });
 *
 * @class GeoExt.component.Map
 */
Ext.define("GeoExt.component.Map", {
    extend: "Ext.Component",
    alias: [
        "widget.gx_map",
        "widget.gx_component_map"
    ],

    requires: [
        'GeoExt.data.LayerStore'
    ],

    /**
     * Whether we already rendered an ol.Map in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,

    /**
     * @property {GeoExt.data.LayerStore} layerStore
     * @private
     */
    layerStore: null,

    config: {
        /**
         * A configured map or a configuration object for the map constructor.
         * @cfg {ol.Map} map
         */
        map: null
    },

    initComponent: function() {
        var me = this;
        if(!(me.getMap() instanceof ol.Map)){
            var olMap = new ol.Map({
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
            me.setMap(olMap);
        }

        me.layerStore = Ext.create('GeoExt.data.LayerStore', {
            storeId: me.getId() + "-store",
            map: me.getMap()
        });

        me.on('resize', me.onResize, me);
        me.callParent();
    },

    onResize: function(){
        // Get the corresponding view of the controller (the mapComponent).
        var me = this;
        if(!me.mapRendered){
            me.getMap().setTarget(me.getTargetEl().dom);
            me.mapRendered = true;
        } else {
            me.getMap().updateSize();
        }
    },

    /**
     * Returns the center coordinate of the view.
     * @return ol.Coordinate
     */
    getCenter: function(){
        return this.getMap().getView().getCenter();
    },

    /**
     * Set the center of the view.
     * @param {ol.Coordinate} center
     */
    setCenter: function(center){
        this.getMap().getView().setCenter(center);
    },

    /**
     * Returns the extent of the current view.
     * @return ol.Extent
     */
    getExtent: function(){
        return this.getView().calculateExtent(this.getMap().getSize());
    },

    /**
     * Set the extent of the view.
     * @param {ol.Extent} extent
     */
    setExtent: function(extent){
        this.getView().fitExtent(extent, this.getMap().getSize());
    },

    /**
     * Returns the layers of the map.
     * @return ol.Collection
     */
    getLayers: function(){
        return this.getMap().getLayers();
    },

    /**
     * Add a layer to the map.
     * @param {ol.layer.Base} layer
     */
    addLayer: function(layer){
        if(layer instanceof ol.layer.Base){
            this.getMap().addLayer(layer);
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' cause it is not ' +
                'an instance of ol.layer.Base');
        }
    },

    /**
     * Add a layer to the map.
     * @param {ol.layer.Base} layer
     */
    removeLayer: function(layer){
        if(layer instanceof ol.layer.Base){
            if(Ext.Array.contains(this.getLayers().getArray(), layer)){
                this.getMap().removeLayer(layer);
            }
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' cause it is not ' +
                'an instance of ol.layer.Base');
        }
    },

    /**
     * Returns the GeoExt.data.LayerStore
     * @return GeoExt.data.LayerStore
     */
    getStore: function(){
        return this.layerStore;
    },

    /**
     * Returns the view of the map.
     * @return ol.View
     */
    getView: function(){
        return this.getMap().getView();
    },

    /**
     * Set the view of the map.
     * @param {ol.View} view
     */
    setView: function(view){
        this.getMap().setView(view);
    }
});
