"use strict"

ResourceLoader.pushRelativePaths([
    "ClearApp.js",
])

ResourceLoader.pushDoneCallback( () => {
    ClearApp.shared().run()
})
