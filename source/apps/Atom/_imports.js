"use strict"

JSImporter.pushRelativePaths([
    "AtomApp.js"
])

JSImporter.pushDoneCallback( () => {
    AtomApp.shared().run()
})

