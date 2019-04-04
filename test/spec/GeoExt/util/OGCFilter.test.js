Ext.Loader.syncRequire(['GeoExt.util.OGCFilter']);

describe('GeoExt.util.OGCFilter', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.util.OGCFilter).not.to.be(undefined);
        });

    });

    describe('static methods', function() {

        var filters = [
            {
                config: {
                    operator: 'like',
                    property: 'NAME'
                },
                getValue: function() {
                    return 'd';
                }
            }, {
                config: {
                    operator: 'in',
                    property: '"WARNCELLID"'
                },
                getValue: function() {
                    return [105120000, 105124000, 105158000];
                }
            }, {
                config: {
                    operator: 'eq',
                    property: '"WARNCELLID"'
                },
                getValue: function() {
                    return 105124000;
                }
            }, {
                config: {
                    operator: 'ne',
                    property: '"WARNCELLID"'
                },
                getValue: function() {
                    return 105124001;
                }
            }, {
                config: {
                    operator: '==',
                    property: '"BOOLFIELD"'
                },
                getValue: function() {
                    return true;
                }
            }, {
                config: {
                    operator: '!==',
                    property: '"BOOLFIELD"'
                },
                getValue: function() {
                    return false;
                }
            }, {
                config: {
                    operator: 'lt',
                    property: '"PROCESSTIME"'
                },
                getValue: function() {
                    return 1554501600000;
                },
                isDateValue: true
            }, {
                config: {
                    operator: 'gt',
                    property: '"PROCESSTIME"'
                },
                getValue: function() {
                    return 1554069600000;
                },
                isDateValue: true
            }
        ];

        var expectedWMSFilter =
            '<Filter>' +
              '<And>' +
                '<PropertyIsLike wildCard="*" singleChar="." escape="!" ' +
                'matchCase="false">' +
                '<PropertyName>NAME</PropertyName>' +
                '<Literal>*d*</Literal>' +
                '</PropertyIsLike>' +
                '<Or>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105120000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105158000</Literal>' +
                '</PropertyIsEqualTo>' +
                '</Or>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105124001</Literal>' +
                '</PropertyIsNotEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"BOOLFIELD"</PropertyName>' +
                    '<Literal>true</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>"BOOLFIELD"</PropertyName>' +
                    '<Literal>false</Literal>' +
                '</PropertyIsNotEqualTo>' +
              '</And>' +
            '</Filter>';

        var expectedWFS1xFilter =
            '<Filter xmlns="http://www.opengis.net/ogc">' +
              '<And>' +
                '<PropertyIsLike wildCard="*" singleChar="." escape="!" ' +
                'matchCase="false">' +
                    '<PropertyName>NAME</PropertyName>' +
                    '<Literal>*d*</Literal>' +
                '</PropertyIsLike>' +
                '<Or>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105120000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105158000</Literal>' +
                '</PropertyIsEqualTo>' +
                '</Or>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>"WARNCELLID"</PropertyName>' +
                    '<Literal>105124001</Literal>' +
                '</PropertyIsNotEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>"BOOLFIELD"</PropertyName>' +
                    '<Literal>true</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>"BOOLFIELD"</PropertyName>' +
                    '<Literal>false</Literal>' +
                '</PropertyIsNotEqualTo>' +
              '</And>' +
            '</Filter>';

        var expectedWFS2Filter =
            '<Filter xmlns="http://www.opengis.net/fes/2.0">' +
              '<And>' +
                '<PropertyIsLike wildCard="*" singleChar="." escape="!" ' +
                'matchCase="false">' +
                    '<ValueReference>NAME</ValueReference>' +
                    '<Literal>*d*</Literal>' +
                '</PropertyIsLike>' +
                '<Or>' +
                '<PropertyIsEqualTo>' +
                    '<ValueReference>"WARNCELLID"</ValueReference>' +
                    '<Literal>105120000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<ValueReference>"WARNCELLID"</ValueReference>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<ValueReference>"WARNCELLID"</ValueReference>' +
                    '<Literal>105158000</Literal>' +
                '</PropertyIsEqualTo>' +
                '</Or>' +
                '<PropertyIsEqualTo>' +
                    '<ValueReference>"WARNCELLID"</ValueReference>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<ValueReference>"WARNCELLID"</ValueReference>' +
                    '<Literal>105124001</Literal>' +
                '</PropertyIsNotEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<ValueReference>"BOOLFIELD"</ValueReference>' +
                    '<Literal>true</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<ValueReference>"BOOLFIELD"</ValueReference>' +
                    '<Literal>false</Literal>' +
                '</PropertyIsNotEqualTo>' +
              '</And>' +
            '</Filter>';

        var expectedGetFeature10Filter =
          '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="JSON" ' +
            'xmlns:wfs="http://www.opengis.net/wfs" ' +
            'xmlns="http://www.opengis.net/ogc" ' +
            'xmlns:gml="http://www.opengis.net/gml" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xsi:schemaLocation="http://www.opengis.net/wfs ' +
            'http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">' +
            '<wfs:Query typeName="dwd:Warngebiete_Kreise">' +
              expectedWFS1xFilter +
            '</wfs:Query>' +
          '</wfs:GetFeature>';

        var expectedGetFeature11Filter =
          '<wfs:GetFeature service="WFS" version="1.1.0" outputFormat="JSON" ' +
            'xmlns:wfs="http://www.opengis.net/wfs" ' +
            'xmlns="http://www.opengis.net/ogc" ' +
            'xmlns:gml="http://www.opengis.net/gml" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xsi:schemaLocation="http://www.opengis.net/wfs ' +
            'http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">' +
            '<wfs:Query typeName="dwd:Warngebiete_Kreise">' +
              expectedWFS1xFilter +
            '</wfs:Query>' +
          '</wfs:GetFeature>';

        var expectedGetFeature20Filter =
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
            '<wfs:Query typeName="dwd:Warngebiete_Kreise">' +
                expectedWFS2Filter +
            '</wfs:Query>' +
          '</wfs:GetFeature>';


        describe('#getOGCWMSFilterFromExtJSFilter', function() {

            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.getOGCWMSFilterFromExtJSFilter).
                    to.be.a('function');
            });

            var wmsFilter = GeoExt.util.OGCFilter.
                getOGCWMSFilterFromExtJSFilter(filters);

            it('returns a valid XML', function() {
                var parser = new DOMParser();
                var doc = parser.parseFromString(wmsFilter, 'application/xml');
                var parseError = doc.getElementsByTagName('parsererror').length;
                expect(parseError).to.be(0);
            });

            it('concatenates filters with `And` per default', function() {
                expect(wmsFilter).to.contain('<And>');
            });

            it('contains all filters', function() {
                expect(wmsFilter).to.be(expectedWMSFilter);
            });

        });

        describe('#getOGCWFSFilterFromExtJSFilter', function() {

            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.getOGCWFSFilterFromExtJSFilter).
                    to.be.a('function');
            });

            var wfsFilter = GeoExt.util.OGCFilter.
                getOGCWFSFilterFromExtJSFilter(filters);

            it('returns a valid XML for WFS 1.0.0', function() {
                var parser = new DOMParser();
                var doc = parser.parseFromString(wfsFilter, 'application/xml');
                var parseError = doc.getElementsByTagName('parsererror').length;
                expect(parseError).to.be(0);
            });

            it('concatenates filters with `And` per default', function() {
                expect(wfsFilter).to.contain('<And>');
            });

            it('contains all filters using wfs 1.0.0 as default', function() {
                expect(wfsFilter).to.be(expectedWFS1xFilter);
            });

            var wfs2Filter = GeoExt.util.OGCFilter.
                getOGCWFSFilterFromExtJSFilter(filters, 'And', '2.0.0');

            it('returns a valid XML for WFS 2.0.0', function() {
                var parser = new DOMParser();
                var doc = parser.parseFromString(wfs2Filter, 'application/xml');
                var parseError = doc.getElementsByTagName('parsererror').length;
                expect(parseError).to.be(0);
            });

            it('concatenates filters with `And`', function() {
                expect(wfs2Filter).to.contain('<And>');
            });

            it('contains all filters', function() {
                expect(wfs2Filter).to.be(expectedWFS2Filter);
            });

        });

        describe('#getOGCFilterFromExtJSFilter', function() {
            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.getOGCWFSFilterFromExtJSFilter).
                    to.be.a('function');
            });

            it('throws with invalid filter array', function() {
                var filters;
                try {
                    filters = GeoExt.util.OGCFilter.getOGCFilterFromExtJSFilter(
                        null, 'wms');
                } catch (e) {
                    expect(filters).to.be(undefined);
                }
            });
        });

        describe('#getOgcFilter', function() {
            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.getOgcFilter).
                    to.be.a('function');
            });

            it('throws with invalid properties', function() {
                var filter;
                try {
                    filter = GeoExt.util.OGCFilter.getOgcFilter(
                        null, 'test', undefined);
                } catch (e) {
                    expect(filter).to.be(undefined);
                }
            });
        });

        describe('#buildWfsGetFeatureWithFilter', function() {
            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.buildWfsGetFeatureWithFilter).
                    to.be.a('function');
            });

            var xml10 = GeoExt.util.OGCFilter.buildWfsGetFeatureWithFilter(
                filters, 'And', '1.0.0', 'dwd:Warngebiete_Kreise');

            var xml11 = GeoExt.util.OGCFilter.buildWfsGetFeatureWithFilter(
                filters, 'And', '1.1.0', 'dwd:Warngebiete_Kreise');

            var xml20 = GeoExt.util.OGCFilter.buildWfsGetFeatureWithFilter(
                filters, 'And', '2.0.0', 'dwd:Warngebiete_Kreise');

            it('returns a valid XML for GetFeature 1.0.0', function() {
                var parser = new DOMParser();
                var doc = parser.parseFromString(xml10, 'application/xml');
                var parseError = doc.getElementsByTagName('parsererror').length;
                expect(parseError).to.be(0);
            });

            it('returns a valid XML for GetFeature 1.1.0', function() {
                var parser = new DOMParser();
                var doc = parser.parseFromString(xml11, 'application/xml');
                var parseError = doc.getElementsByTagName('parsererror').length;
                expect(parseError).to.be(0);
            });

            it('returns a valid XML for GetFeature 2.0.0', function() {
                var parser = new DOMParser();
                var doc = parser.parseFromString(xml20, 'application/xml');
                var parseError = doc.getElementsByTagName('parsererror').length;
                expect(parseError).to.be(0);
            });

            it('contains all filters for WFS 1.0.0', function() {
                expect(xml10).to.be(expectedGetFeature10Filter);
            });

            it('contains all filters for WFS 1.1.0', function() {
                expect(xml11).to.be(expectedGetFeature11Filter);
            });

            it('contains all filters for WFS 2.0.0', function() {
                expect(xml20).to.be(expectedGetFeature20Filter);
            });

        });

    });

});
