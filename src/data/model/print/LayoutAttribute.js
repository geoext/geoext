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
        {name: 'name', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'clientInfo', type: 'auto'},
        {
            name: 'layoutId',
            reference: {
                type: 'print.Layout',
                inverse: 'attributes'
            }
        }
    ]
});
