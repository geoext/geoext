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
        {name: 'name', type: 'string'},
        {
            name: 'capabilityId',
            reference: {
                type: 'print.Capability',
                inverse: 'layouts'
            }
        }
    ]
});
