# ./classic

This folder contains components, which are only compatible with the classic
toolkit of ExtJS (e.g. `StateProvider` or `GeocoderCombo`).
In case you want to use them you also have to add the `classic` folder to the
`classpath`. So your complete `classpath` definition could look like below:

```javascript
    "classpath": [
        "app",
        "${toolkit.name}/src",
        "./lib/geoext3/src",
        "./lib/geoext3/classic"
    ]
```
