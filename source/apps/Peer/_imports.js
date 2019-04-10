"use strict"

ResourceLoader.pushRelativePaths([
    "network/_imports.js",
    "PeerApp.js",
])

ResourceLoader.pushDoneCallback( () => {
    PeerApp.shared().run()
})
