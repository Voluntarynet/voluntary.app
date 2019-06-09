"use strict"

ResourceLoader.pushRelativePaths([
    "external_libs/_imports.js",
    "GameNode.js",
    "GameView.js",
    "ThingView.js",
    "ShipView.js",
    "GameApp.js"
])


ResourceLoader.pushDoneCallback( () => {
    GameApp.shared().run()
})

