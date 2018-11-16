<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>@@EXAMPLE_NAME@@ Example</title>
    <link rel="stylesheet" type="text/css" href="../lib/ol/ol.css">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/extjs/6.2.0/classic/theme-crisp/resources/theme-crisp-all.css"/>
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

    <script src="../lib/ol/ol.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/extjs/6.2.0/ext-all.js"></script>
    <script>
        Ext.Loader.setConfig({
            enabled: true,
            paths: {
                'GeoExt': '../../src/'
            }
        });
    </script>

    <script src="@@EXAMPLE_NAME@@.js"></script>
</body>
</html>
