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

    // <debug>
    symbols: [
        'ol.layer.Group',
        'ol.layer.Base',
        'ol.layer.Base#get'
    ],
    // </debug>

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
                    defaultName = (record.get('isLayerGroup')
                        ? record.unnamedGroupLayerText
                        : record.unnamedLayerText);
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
