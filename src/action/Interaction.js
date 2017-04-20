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

Ext.define('GeoExt.action.Interaction', {
    extend: 'Ext.Action',

    config: {
        /**
         * Makes the action toggleable.
         * @type {Boolean}
         */
        enableToggle: false,

        /**
         * Handler that will be called when the action is called.
         * @type {Function}
         */
        handler: Ext.emptyFn,

        /**
         * Handler that is called when the action is toggled.         *
         * @type {Function}
         * @param {Ext.Component} component The component that is toggled.
         * @param {Boolean} pressed New state of the component.
         */
        toggleHandler: function(component, pressed) {
            var action = this.baseAction;

            if (pressed) {
                action.addInteraction();
            } else {
                action.removeInteraction();
            }

            action.syncToggleState(component, pressed);
        }
    },

    /**
     * Overrides default constructor to allow extension of action
     * configuration options via ExtJS inheritance.
     * @param  {Object} config Configuration options passed by component.
     */
    constructor: function(config) {
        // map default configuration to components configuration
        Ext.applyIf(config, this.config);

        this.initialConfig = config;
        this.itemId = config.itemId = (config.itemId || config.id || Ext.id());
        this.items = [];
    },

    /**
     * Must be implemented to add interactions to the map.
     * @type {Function}
     */
    addInteraction: Ext.emptyFn,

    /**
     * Must be implemented to remove interactions to the map.
     * @type {Function}
     */
    removeInteraction: Ext.emptyFn,

    /**
     * Synchronizes the toggle state of toggle components that use the same
     * action instance.
     * @param  {Ext.Component} component The component that toggled an action.
     * @param  {Boolean} pressed   The state that all compoents should have.
     */
    syncToggleState: function(component, pressed) {
        this.items.forEach(function(item) {
            if (item !== component) {
                item.toggle(pressed, true);
            }
        }, this);
    },

    /**
     * @inheritDoc
     */
    destroy: function() {
        this.removeInteraction();
        this.callParent(arguments);
    }

});
