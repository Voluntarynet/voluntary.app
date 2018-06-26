"use strict"

JSImporter.pushRelativePaths([
    "lib/_imports.js",
    "network/_imports.js",	
    "App.js",
    //"test.json",
    // "_tests.js",
])

JSImporter.pushDoneCallback( () => {
    App.shared().run()

})
