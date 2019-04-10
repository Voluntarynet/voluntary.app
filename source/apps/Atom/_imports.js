"use strict"

ResourceLoader.pushRelativePaths([
    "AtomApp.js"
])

ResourceLoader.pushDoneCallback( () => {
    AtomApp.shared().run()
})

