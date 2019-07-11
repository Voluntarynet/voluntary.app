"use strict"

ResourceLoader.pushRelativePaths([
    "AtomApp.js"
])

ResourceLoader.pushDoneCallback( () => {
    window.AtomApp.shared().run()
})

