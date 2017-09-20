"use strict"

JSImporter.pushRelativePaths([
	"lib/_imports.js",
	"network/_imports.js",	
    "App.js",
   // "_tests.js",
])

JSImporter.pushDoneCallback( () => {
        App.shared()
		if (App.runTests) {
		    App.runTests()
		}
})
