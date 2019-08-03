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
                        // sadly we cannot abort the forEach-iteration here
                    }
                });
            }

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
                    // sadly we cannot abort the forEach-iteration here
                }
            });

            return index;
        }
    }
});
