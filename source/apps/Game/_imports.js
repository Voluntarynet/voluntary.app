"use strict"

JSImporter.pushRelativePaths([
    "GameNode.js",
    "GameView.js",
    "GameApp.js"
])


JSImporter.pushDoneCallback( () => {
    GameApp.shared().run()
})

