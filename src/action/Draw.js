/* Copyright (c) 2015-2016 The Open Source Geospatial Foundation
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

Ext.define('GeoExt.action.Draw', {
    extend: 'GeoExt.action.Interaction',

    config: {
        /**
         * @inheritDoc
         */
        text: 'Draw',

        /**
         * Will allow to add/remove the interaction from the map by cycling the
         * buttons state.
         *
         * @inheritDoc
         */
        enableToggle: true,

        /**
         * @inheritDoc
         */
        toggleGroup: 'gx-draw-interaction',

        /**
         * The map that will be measured on.
         * @type {ol.Map}
         */
        map: null,

        /**
         * The layer source that will be used to add measure geometries.
         * @type {ol.source.Source}
         */
        source: null,

        /**
         * Message to show before the user draws a geometry.
         * @type {String}
         */
        helpTxt: 'Click to start drawing',

        /**
         * Message to show when the user is drawing a polygon.
         * @type {string}
         */
        helpContinueTxt: 'Click to continue drawing',

        /**
         * Type of measuring tool. May be 'Polygon' or 'LineString'.
         * @type {String}
         */
        type: 'Polygon',

        /**
         * Class that will be added to the tool elements.
         * @type {String}
         */
        tooltipCls: 'gx-tooltip',

        /**
         * Default style of drawn features.
         * @type {ol.style.Style}
         */
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    },

    /**
     * Currently drawn feature.
     * @type {ol.Feature}
     * @private
     */
    sketch: null,

    /**
     * The interaction that will be added to the map.
     * @type {ol.interaction.Draw}
     * @private
     */
    drawInteraction: null,

    /**
     * The help tooltip element.
     * @type {Element}
     * @private
     */
    helpTooltipElement: null,

    /**
     * Overlay to show the help messages.
     * @type {ol.Overlay}
     * @private
     */
    helpTooltip: null,

    constructor: function() {
        this.callParent(arguments);
    },

    /**
     * Adds the measure interaction to the map.
     */
    addInteraction: function() {
        var config = this.initialConfig;

        // has been added by another component that uses this action
        this.drawInteraction = new ol.interaction.Draw({
            source: config.source,
            type: config.type,
            style: config.style
        });
        config.map.addInteraction(this.drawInteraction);

        config.map.on('pointermove', this.onPointerMove, this);
        this.drawInteraction.on('drawstart', this.onDrawStart, this);
        this.drawInteraction.on('drawend', this.onDrawEnd, this);

        this.createHelpTooltip();
    },

    /**
     * Removes the interaction from the map.
     */
    removeInteraction: function() {
        var config = this.initialConfig;

        // remove current tooltips
        this.removeHelpTooltip();
        if (this.measureTooltip) {
            this.removeMeasureTooltip(this.measureTooltip);
        }

        // remove interaction from map
        config.map.removeInteraction(this.drawInteraction);

        // unbind event listeners
        config.map.un('pointermove', this.onPointerMove, this);
        this.drawInteraction.un('drawstart', this.onDrawStart, this);
        this.drawInteraction.un('drawend', this.onDrawEnd, this);
    },

    /**
     * Creates a new help tooltip
     */
    createHelpTooltip: function() {
        var config = this.initialConfig;

        this.removeHelpTooltip();

        this.helpTooltipElement = document.createElement('div');
        this.helpTooltipElement.className = config.tooltipCls + ' hidden';
        this.helpTooltip = new ol.Overlay({
            element: this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        config.map.addOverlay(this.helpTooltip);

        // hide tooltip outside of map viewport
        config.map.getViewport()
            .removeEventListener('mouseout', this.onViewportMouseOut, this);
    },

    removeHelpTooltip: function() {
        var config = this.initialConfig;
        var viewport = config.map.getViewport();

        if (this.helpTooltip) {
            viewport.removeEventListener('mouseout',
                this.onViewportMouseOut, this);

            config.map.removeOverlay(this.helpTooltip);
            this.helpTooltipElement.parentNode
                .removeChild(this.helpTooltipElement);
            this.helpTooltip = null;
            this.helpTooltipElement = null;
        }
    },

    onDrawStart: function(evt) {
        this.sketch = evt.feature;
        this.tooltipCoord = evt.coordinate;
    },

    onDrawEnd: function() {
        this.sketch = null;
    },

    /**
     * Handle pointer move.
     * @param {ol.MapBrowserEvent} evt The event.
     */
    onPointerMove: function(evt) {
        var config = this.initialConfig;
        var helpTxt = this.sketch
            ? config.helpContinueTxt
            : config.helpTxt;

        if (evt.dragging) {
            return;
        }

        this.helpTooltipElement.innerHTML = helpTxt;
        this.helpTooltip.setPosition(evt.coordinate);

        this.helpTooltipElement.classList.remove('hidden');
    },

    /**
     * Hides the pointer tooltip.
     */
    onViewportMouseOut: function() {
        this.helpTooltipElement.classList.add('hidden');
    }
});
