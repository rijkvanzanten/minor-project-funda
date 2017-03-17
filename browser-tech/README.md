# Browser Technologies Research

The current implementation of the Funda AR Webapp fully relies on JavaScript (JS) for data fetching and view rendering. Because of that; opening the app without JS results in the following:

![Artists rendition of the Funda AR App without JS](phone.png)  
_Artists rendition of the Funda AR App without JS_

The main feature of the app is viewing which houses are the nearest to your current location. The reason that it fully depends on JS at the moment is because we use the users current GPS location to request the nearest houses.  
This has as a negative side-effect that the app won't function as expected when the user doesn't allow GPS tracking.

We could solve this by adding a input field for zip-code, which could be easily removed when the user allows GPS tracking. To be able to request the houses without JS we could make the zip-code input make a POST request so we're able to do the housing-requests server-side.

The other two major JS-requirements to make the full AR experience possible is access to the deviceorientation data and video camera feed. When the camera view isn't available, we could fall back to a compass - radar like - interface which will still show the houses locations based on the users current position. If the deviceorientation isn't available, we should fall back to a "regular" list of houses, as can be found on the Funda site itself.

The easiest easiest fix will be redirecting the user to the map view on the funda site when we detect that either of the three major requirements isn't met. The map view on the funda site already has implemented the solutions mentioned above.
