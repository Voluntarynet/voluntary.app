"use strict"

JSImporter.pushRelativePaths([
    "PeerApp.js",
])

JSImporter.pushDoneCallback( () => {
    PeerApp.shared().run()
})
