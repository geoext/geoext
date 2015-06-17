<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>@@EXAMPLE_NAME@@ Example</title>
    <link rel="stylesheet" type="text/css" href="http://openlayers.org/en/master/css/ol.css">
    <link rel="stylesheet" type="text/css" href="http://cdn.sencha.com/ext/gpl/5.1.0/packages/ext-theme-crisp/build/resources/ext-theme-crisp-all.css"/>
</head>

<body>

    <div id='description'>
        <p>
            This example shows ...
        </p>
        <p>
            Have a look at <a href="@@EXAMPLE_NAME@@.js">@@EXAMPLE_NAME@@.js</a> to see how this is
            done.
        </p>
    </div>

    <script src="http://openlayers.org/en/master/build/ol.js"></script>
    <script src="http://cdn.sencha.com/ext/gpl/5.1.0/build/ext-all.js"></script>
    <script>
        Ext.Loader.setConfig({
            enabled: true,
            paths: {
                'GeoExt': '../../src/'
            }
        });
    </script>

    <script src="@@EXAMPLE_NAME@@.js"></script>
    <!-- Automatically reload on source changes, just append #reload to URL -->
    <script src="../../util/live-reload.js"></script>
</body>
</html>
