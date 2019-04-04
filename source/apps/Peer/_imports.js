"use strict"

JSImporter.pushRelativePaths([
    "network/_imports.js",
    "PeerApp.js",
])

JSImporter.pushDoneCallback( () => {
    PeerApp.shared().run()
})
