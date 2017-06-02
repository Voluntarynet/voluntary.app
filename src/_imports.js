
JSImporter.pushRelativePaths([
	"lib/_imports.js",
	"network/_imports.js",
	"view/_imports.js",
	
    "App.js",
    "_tests.js",
])

JSImporter.pushDoneCallback( () => {
        App.shared()
		App.runTests()
})
