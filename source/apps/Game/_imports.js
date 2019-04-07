"use strict"

JSImporter.pushRelativePaths([
    "external_libs/_imports.js",
    "svg/_imports.js",
    "GameNode.js",
    "GameView.js",
    "ThingView.js",
    "ShipView.js",
    "GameApp.js"
])


JSImporter.pushDoneCallback( () => {
    GameApp.shared().run()
})

