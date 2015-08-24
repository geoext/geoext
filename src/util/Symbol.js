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
 * A utility class providing methods to check for symbols of OpenLayers we
 * depend upon.
 *
 * This class can be used to check if the dependencies to external symbols are
 * fulfilled. An example:
 *
 *     Ext.define('MyNewClass.DependingOnOpenLayersClasses', {
 *         requires: ['GeoExt.util.Symbol'],
 *         // the contents of the `symbols` property will be checked
 *         symbols: [
 *             'ol.Map', // checking a class
 *             'ol.View.prototype.constrainResolution', // an instance method
 *             'ol.control.ScaleLine#getUnits', // other way for instance method
 *             'ol.color.asArray', // one way to reference a static method
 *             'ol.color::asString' // other way to reference a static method
 *         ]
 *         // … your configuration and methods …
 *     }, function(cls) {
 *         // actually call `check` with the just defined class:
 *         GeoExt.util.Symbol.check(cls);
 *     });
 *
 * Since this sort of checking usually only makes sense in debug mode, you can
 * additionally wrap the `symbols`-configuration and the call to `check` in
 * these &lt;debug&gt;-line comments:
 *
 *     Ext.define('MyNewClass.DependingOnOpenLayersClasses', {
 *         requires: ['GeoExt.util.Symbol'],
 *         // <debug>
 *         symbols: []
 *         // </debug>
 *     }, function(cls) {
 *         // <debug>
 *         GeoExt.util.Symbol.check(cls);
 *         // </debug>
 *     });
 *
 * This means that the array of symbols and the check itself will not happen in
 * production builds as the wrapped lines are simply removed from the final
 * JavaScript.
 *
 * If one of the symbols cannot be found, a warning will be printed to the
 * developer console (via `Ext.log.warn`, which will only print in a debug
 * build):
 *
 *     [W] The class "MyNewClass.DependingOnOpenLayersClasses" depends on the
 *     external symbol "ol.color.notExisting", which does not seem to exist.
 *
 * @class GeoExt.util.Symbol
 */
Ext.define('GeoExt.util.Symbol', {
    extend: 'Ext.Base',
    statics: {
        /**
         * An object that we will use to store already looked up references in.
         *
         * The key will be a symbol (after it has been normalized by the
         * method #normalizeSymbol), and the value will be a boolean indicating
         * if the symbol was found to be defined when it was checked.
         *
         * @private
         */
        _checked: {
            // will be filled while we are checking stuff for existance
        },

        /**
         * Checks whether the required symbols of the given class are defined
         * in the global context. Will log to the console if a symbol cannot be
         * found.
         *
         * @param {Ext.Base} An ext class defining a property `symbols` that
         *     that this method will check.
         */
        check: function(cls) {
            var staticMe = this;
            var proto = cls.prototype;
            var olSymbols = proto && proto.symbols;
            var clsName = proto && proto['$className'];
            if (!olSymbols) {
                return;
            }
            Ext.each(olSymbols, function(olSymbol) {
                olSymbol = staticMe.normalizeSymbol(olSymbol);
                staticMe.checkSymbol(olSymbol, clsName);
            });
        },

        /**
         * Normalizes a short form of a symbol to a canonical one we use to
         * store the results of the #isDefinedSymbol method. The following two
         * normalizations take place:
         *
         * * A `#` in the symbol is being replaced with `.prototype.` so that
         *   e.g. the symbol `'ol.Class#methodName'` turns into the symbol
         *   `'ol.Class.prototype.methodName'`
         * * A `::` in the symbol is being replaced with `.` so that
         *   e.g. the symbol `'ol.Class::staticMethodName'` turns into the
         *   symbol `'ol.Class.staticMethodName'`
         *
         * @param {String} symbolStr A string to normalize.
         * @return {String} The normalized string.
         * @private
         */
        normalizeSymbol: (function() {
            var hashRegEx = /#/g;
            var colonRegEx = /::/g;
            var normalizeFunction = function(symbolStr){
                if (hashRegEx.test(symbolStr)) {
                    symbolStr = symbolStr.replace(hashRegEx, '.prototype.');
                } else if (colonRegEx.test(symbolStr)) {
                    symbolStr = symbolStr.replace(colonRegEx, '.');
                }
                return symbolStr;
            };
            return normalizeFunction;
        }()),

        /**
         * Checks the passed symbolStr and raises a warning if it cannot be
         * found.
         *
         * @param {String} symbolStr A string to check. Usually this string has
         *     been {@link #normalizeSymbol normalized} already.
         * @param {String} [clsName] The optional name of the class that
         *     requires the passed openlayers symbol.
         * @private
         */
        checkSymbol: function(symbolStr, clsName){
            var isDefined = this.isDefinedSymbol(symbolStr);
            if (!isDefined) {
                Ext.log.warn(
                    'The class "' + (clsName || 'unknown') + '" ' +
                    'depends on the external symbol "' + symbolStr + '", ' +
                    'which does not seem to exist.'
                );
            }
        },

        /**
         * Checks if the passed symbolStr is defined.
         *
         * @param {String} symbolStr A string to check. Usually this string has
         *     been {@link #normalizeSymbol normalized} already.
         * @return {Boolean} Whether the symbol is defined or not.
         * @private
         */
        isDefinedSymbol: function(symbolStr){
            var checkedCache = this._checked;
            if (Ext.isDefined(checkedCache[symbolStr])) {
                return checkedCache[symbolStr];
            }
            var parts = symbolStr.split('.');
            var lastIdx = parts.length - 1;
            var curSymbol = Ext.getWin().dom;
            var isDefined = false;
            var intermediateSymb = '';
            Ext.each(parts, function(part, idx){
                if (intermediateSymb !== '') {
                    intermediateSymb += '.';
                }
                intermediateSymb += part;
                if(curSymbol[part]) {
                    checkedCache[intermediateSymb] = true;
                    curSymbol = curSymbol[part];
                    if (lastIdx === idx) {
                        isDefined = true;
                    }
                } else {
                    checkedCache[intermediateSymb] = false;
                    return false; // break early
                }
            });
            checkedCache[symbolStr] = isDefined;
            return isDefined;
        }
    }
});
