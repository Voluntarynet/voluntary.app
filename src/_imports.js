"use strict"

JSImporter.pushRelativePaths([
    "lib/_imports.js",
    "network/_imports.js",	
    "graphics/_imports.js",	
    "PeerApp.js",
    // "_tests.js",
])

JSImporter.pushDoneCallback( () => {
    PeerApp.shared().run()
})
