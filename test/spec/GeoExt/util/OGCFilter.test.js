Ext.Loader.syncRequire(['GeoExt.util.OGCFilter']);

function getNumParserErrors(xmlStr) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlStr, 'application/xml');
    return doc.getElementsByTagName('parsererror').length;
}


describe('GeoExt.util.OGCFilter', function() {
    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.util.OGCFilter).not.to.be(undefined);
        });
    });

    describe('static methods', function() {
        var filters = [
            {
                getProperty: function() {
                    return 'NAME';
                },
                getOperator: function() {
                    return 'like';
                },
                getValue: function() {
                    return 'd';
                }
            }, {
                getProperty: function() {
                    return 'WARNCELLID';
                },
                getOperator: function() {
                    return 'in';
                },
                getValue: function() {
                    return [105120000, 105124000, 105158000];
                }
            }, {
                getProperty: function() {
                    return 'WARNCELLID';
                },
                getOperator: function() {
                    return 'eq';
                },
                getValue: function() {
                    return 105124000;
                }
            }, {
                getProperty: function() {
                    return 'WARNCELLID';
                },
                getOperator: function() {
                    return 'ne';
                },
                getValue: function() {
                    return 105124001;
                }
            }, {
                getProperty: function() {
                    return 'BOOLFIELD';
                },
                getOperator: function() {
                    return '==';
                },
                getValue: function() {
                    return true;
                }
            }, {
                getProperty: function() {
                    return 'BOOLFIELD';
                },
                getOperator: function() {
                    return '!==';
                },
                getValue: function() {
                    return false;
                }
            }, {
                getProperty: function() {
                    return 'PROCESSTIME';
                },
                getOperator: function() {
                    return 'lt';
                },
                getValue: function() {
                    return new Date('2019-04-06');
                },
                isDateValue: true
            }, {
                getProperty: function() {
                    return 'PROCESSTIME';
                },
                getOperator: function() {
                    return 'gt';
                },
                getValue: function() {
                    return new Date('2019-04-01');
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
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105120000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105158000</Literal>' +
                '</PropertyIsEqualTo>' +
                '</Or>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105124001</Literal>' +
                '</PropertyIsNotEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>BOOLFIELD</PropertyName>' +
                    '<Literal>true</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>BOOLFIELD</PropertyName>' +
                    '<Literal>false</Literal>' +
                '</PropertyIsNotEqualTo>' +
                '<PropertyIsLessThan>' +
                  '<PropertyName>PROCESSTIME</PropertyName>' +
                  '<Literal>2019-04-06</Literal>' +
                '</PropertyIsLessThan>' +
                '<PropertyIsGreaterThan>' +
                  '<PropertyName>PROCESSTIME</PropertyName>' +
                  '<Literal>2019-04-01</Literal>' +
                '</PropertyIsGreaterThan>' +
              '</And>' +
            '</Filter>';

        var expectedWFS1xFilter =
            '<Filter xmlns="http://www.opengis.net/ogc" ' +
            'xmlns:gml="http://www.opengis.net/gml">' +
              '<And>' +
                '<PropertyIsLike wildCard="*" singleChar="." escape="!" ' +
                'matchCase="false">' +
                    '<PropertyName>NAME</PropertyName>' +
                    '<Literal>*d*</Literal>' +
                '</PropertyIsLike>' +
                '<Or>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105120000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105158000</Literal>' +
                '</PropertyIsEqualTo>' +
                '</Or>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105124000</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>WARNCELLID</PropertyName>' +
                    '<Literal>105124001</Literal>' +
                '</PropertyIsNotEqualTo>' +
                '<PropertyIsEqualTo>' +
                    '<PropertyName>BOOLFIELD</PropertyName>' +
                    '<Literal>true</Literal>' +
                '</PropertyIsEqualTo>' +
                '<PropertyIsNotEqualTo>' +
                    '<PropertyName>BOOLFIELD</PropertyName>' +
                    '<Literal>false</Literal>' +
                '</PropertyIsNotEqualTo>' +
                '<PropertyIsLessThan>' +
                  '<PropertyName>PROCESSTIME</PropertyName>' +
                  '<Literal>2019-04-06</Literal>' +
                '</PropertyIsLessThan>' +
                '<PropertyIsGreaterThan>' +
                  '<PropertyName>PROCESSTIME</PropertyName>' +
                  '<Literal>2019-04-01</Literal>' +
                '</PropertyIsGreaterThan>' +
              '</And>' +
            '</Filter>';

        var expectedWFS2Filter =
            '<fes:Filter ' +
                'xsi:schemaLocation="http://www.opengis.net/fes/2.0 ' +
                'http://schemas.opengis.net/filter/2.0/filterAll.xsd ' +
                'http://www.opengis.net/gml/3.2 ' +
                'http://schemas.opengis.net/gml/3.2.1/gml.xsd" ' +
                'xmlns:fes="http://www.opengis.net/fes/2.0" ' +
                'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                '<fes:And>' +
                '<fes:PropertyIsLike wildCard="*" singleChar="." escape="!" ' +
                'matchCase="false">' +
                    '<fes:ValueReference>NAME</fes:ValueReference>' +
                    '<fes:Literal>*d*</fes:Literal>' +
                '</fes:PropertyIsLike>' +
                '<fes:Or>' +
                '<fes:PropertyIsEqualTo>' +
                    '<fes:ValueReference>WARNCELLID</fes:ValueReference>' +
                    '<fes:Literal>105120000</fes:Literal>' +
                '</fes:PropertyIsEqualTo>' +
                '<fes:PropertyIsEqualTo>' +
                    '<fes:ValueReference>WARNCELLID</fes:ValueReference>' +
                    '<fes:Literal>105124000</fes:Literal>' +
                '</fes:PropertyIsEqualTo>' +
                '<fes:PropertyIsEqualTo>' +
                    '<fes:ValueReference>WARNCELLID</fes:ValueReference>' +
                    '<fes:Literal>105158000</fes:Literal>' +
                '</fes:PropertyIsEqualTo>' +
                '</fes:Or>' +
                '<fes:PropertyIsEqualTo>' +
                    '<fes:ValueReference>WARNCELLID</fes:ValueReference>' +
                    '<fes:Literal>105124000</fes:Literal>' +
                '</fes:PropertyIsEqualTo>' +
                '<fes:PropertyIsNotEqualTo>' +
                    '<fes:ValueReference>WARNCELLID</fes:ValueReference>' +
                    '<fes:Literal>105124001</fes:Literal>' +
                '</fes:PropertyIsNotEqualTo>' +
                '<fes:PropertyIsEqualTo>' +
                    '<fes:ValueReference>BOOLFIELD</fes:ValueReference>' +
                    '<fes:Literal>true</fes:Literal>' +
                '</fes:PropertyIsEqualTo>' +
                '<fes:PropertyIsNotEqualTo>' +
                    '<fes:ValueReference>BOOLFIELD</fes:ValueReference>' +
                    '<fes:Literal>false</fes:Literal>' +
                '</fes:PropertyIsNotEqualTo>' +
                '<fes:PropertyIsLessThan>' +
                  '<fes:ValueReference>PROCESSTIME</fes:ValueReference>' +
                  '<fes:Literal>2019-04-06</fes:Literal>' +
                '</fes:PropertyIsLessThan>' +
                '<fes:PropertyIsGreaterThan>' +
                  '<fes:ValueReference>PROCESSTIME</fes:ValueReference>' +
                  '<fes:Literal>2019-04-01</fes:Literal>' +
                '</fes:PropertyIsGreaterThan>' +
              '</fes:And>' +
            '</fes:Filter>';

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


        describe('#getOgcWmsFilterFromExtJsFilter', function() {

            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.getOgcWmsFilterFromExtJsFilter).
                    to.be.a('function');
            });

            describe('WMS', function() {
                var wmsFilter = GeoExt.util.OGCFilter.
                    getOgcWmsFilterFromExtJsFilter(filters);

                it('returns a valid XML', function() {
                    expect(getNumParserErrors(wmsFilter)).to.be(0);
                });

                it('concatenates filters with `And` per default', function() {
                    expect(wmsFilter).to.contain('<And>');
                });

                it('contains all filters', function() {
                    expect(wmsFilter).to.be(expectedWMSFilter);
                });
            });

            describe('WFS 1.0.0', function() {
                var wfsFilter = GeoExt.util.OGCFilter.
                    getOgcWfsFilterFromExtJsFilter(filters);

                it('returns a valid XML for WFS 1.0.0', function() {
                    expect(getNumParserErrors(wfsFilter)).to.be(0);
                });

                it('concatenates filters with `And` per default', function() {
                    expect(wfsFilter).to.contain('<And>');
                });

                it('contains all filters using wfs 1.0.0 default', function() {
                    expect(wfsFilter).to.be(expectedWFS1xFilter);
                });
            });

            describe('WFS 2.0.0', function() {
                var wfs2Filter = GeoExt.util.OGCFilter.
                    getOgcWfsFilterFromExtJsFilter(filters, 'And', '2.0.0');

                it('returns a valid XML for WFS 2.0.0', function() {
                    expect(getNumParserErrors(wfs2Filter)).to.be(0);
                });

                it('concatenates filters with `And`', function() {
                    expect(wfs2Filter).to.contain('<fes:And>');
                });

                it('contains all filters', function() {
                    expect(wfs2Filter).to.be(expectedWFS2Filter);
                });
            });
        });

        describe('#getOgcFilterFromExtJsFilter', function() {
            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.getOgcWfsFilterFromExtJsFilter).
                    to.be.a('function');
            });

            it('throws with invalid filter array', function() {
                var f;
                try {
                    f = GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(
                        null, 'wms');
                } catch (e) {
                    expect(f).to.be(undefined);
                }
            });

            it('returns null if called with empty filters array', function() {
                var got = GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(
                    [], 'wms');
                expect(got).to.be(null);
            });
        });

        describe('#getOgcFilterBodyFromExtJsFilterObject', function() {
            it('is defined', function() {
                var ogcUtil = GeoExt.util.OGCFilter;
                expect(ogcUtil.getOgcFilterBodyFromExtJsFilterObject).
                    to.be.a('function');
            });

            it('throws with invalid filter', function() {
                var filter;
                var ogcUtil = GeoExt.util.OGCFilter;
                try {
                    filter = ogcUtil.getOgcFilterBodyFromExtJsFilterObject(
                        null, 'wms');
                } catch (e) {
                    expect(filter).to.be(undefined);
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

            it('supports lte filter', function() {
                var filter = GeoExt.util.OGCFilter.getOgcFilter(
                    'humpty-dumpty', 'lte', 4711
                );
                var expected = '<PropertyIsLessThanOrEqualTo>'
                    + '<PropertyName>humpty-dumpty</PropertyName>'
                    + '<Literal>4711</Literal>'
                    + '</PropertyIsLessThanOrEqualTo>';
                expect(filter).to.be(expected);
            });
            it('supports gte filter', function() {
                var filter = GeoExt.util.OGCFilter.getOgcFilter(
                    'humpty-dumpty', 'gte', 4711
                );
                var expected = '<PropertyIsGreaterThanOrEqualTo>'
                    + '<PropertyName>humpty-dumpty</PropertyName>'
                    + '<Literal>4711</Literal>'
                    + '</PropertyIsGreaterThanOrEqualTo>';
                expect(filter).to.be(expected);
            });

            it('supports spatial filters for WFS 1.x', function() {
                var wfsVersion = '1.1.0';
                var coords = [[16, 48], [19, 9]];
                var epsg = 'EPSG:4326';
                var geometry = new ol.geom.LineString(coords);
                var propertyName = 'nice-geometry-attribute';
                var topologicalOperators = {
                    'intersect': 'Intersects',
                    'within': 'Within',
                    'contains': 'Contains',
                    'equals': 'Equals',
                    'disjoint': 'Disjoint',
                    'crosses': 'Crosses',
                    'touches': 'Touches',
                    'overlaps': 'Overlaps'
                };

                Ext.iterate(topologicalOperators, function(key, val) {
                    var filter = GeoExt.util.OGCFilter.getOgcFilter(
                        propertyName, key, geometry, wfsVersion, epsg
                    );

                    var gmlElement = '<LineString' +
                        ' xmlns="http://www.opengis.net/gml"' +
                        ' srsName="EPSG:4326"><posList srsDimension="2">' +
                        '48 16 9 19</posList></LineString>';

                    var expected = Ext.String.format(
                        GeoExt.util.OGCFilter.spatialFilterWfs1xXmlTpl,
                        val,
                        propertyName,
                        gmlElement
                    );

                    expect(filter).to.equal(expected);
                });
            });

            it('supports WFS 2.0.0 - FES 2.0 filters', function() {
                var wfsVersion = '2.0.0';
                var coords = [[16, 48], [19, 9]];
                var epsg = 'EPSG:4326';
                var geometry = new ol.geom.LineString(coords);
                var propertyName = 'nice-geometry-attribute';
                var topologicalOperators = {
                    'intersect': 'Intersects',
                    'within': 'Within',
                    'contains': 'Contains',
                    'equals': 'Equals',
                    'disjoint': 'Disjoint',
                    'crosses': 'Crosses',
                    'touches': 'Touches',
                    'overlaps': 'Overlaps'
                };

                var gmlElement = Ext.String.format(
                    GeoExt.util.OGCFilter.gml32LineStringTpl,
                    epsg,
                    GeoExt.util.OGCFilter.flattenCoordinates(coords)
                );

                Ext.iterate(topologicalOperators, function(key, val) {
                    var filter = GeoExt.util.OGCFilter.getOgcFilter(
                        propertyName, key, geometry, wfsVersion, epsg
                    );

                    var expected = Ext.String.format(
                        GeoExt.util.OGCFilter.spatialFilterWfs2xXmlTpl,
                        val,
                        propertyName,
                        gmlElement
                    );

                    expect(filter).to.equal(expected);
                });
            });

            it('supports bbox filters', function() {
                var wfsVersion = '1.1.0';
                var coords = [[16, 48], [19, 9]];
                var epsg = 'EPSG:4326';
                var geometry = new ol.geom.LineString(coords);
                var propertyName = 'nice-geometry-attribute';
                var expected = '<BBOX>' +
                    '    <PropertyName>' + propertyName + '</PropertyName>' +
                    '    <gml:Envelope' +
                    '        xmlns:gml="http://www.opengis.net/gml" srsName="'
                    + epsg + '">' +
                    '        <gml:lowerCorner>16 9</gml:lowerCorner>' +
                    '        <gml:upperCorner>19 48</gml:upperCorner>' +
                    '    </gml:Envelope>' +
                    '</BBOX>';

                var filter = GeoExt.util.OGCFilter.getOgcFilter(
                    propertyName, 'bbox', geometry, wfsVersion, epsg
                );

                expect(filter).to.equal(expected);
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
                expect(getNumParserErrors(xml10)).to.be(0);
            });

            it('returns a valid XML for GetFeature 1.1.0', function() {
                expect(getNumParserErrors(xml11)).to.be(0);
            });

            it('returns a valid XML for GetFeature 2.0.0', function() {
                expect(getNumParserErrors(xml20)).to.be(0);
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

        describe('#createSpatialFilter', function() {
            it('is defined', function() {
                expect(GeoExt.util.OGCFilter.createSpatialFilter).
                    to.be.a('function');
            });

            it('returns null for invalid operator type', function() {
                var wrongOperator = 'NOT_VALID';
                var result = GeoExt.util.OGCFilter.
                    createSpatialFilter(wrongOperator);
                expect(result).to.be(null);
            });

            it('returns a valid spatial filter', function() {
                var coords = [[16, 48], [19, 9]];
                var epsg = 'EPSG:4326';
                var geometry = new ol.geom.LineString(coords);
                var propertyName = 'nice-geometry-attribute';
                var operator = 'intersect';

                var result = GeoExt.util.OGCFilter.
                    createSpatialFilter(operator, propertyName, geometry, epsg);
                expect(result).not.to.be(null);
            });

        });

    });

});
