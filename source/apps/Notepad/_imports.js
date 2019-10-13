"use strict"

ResourceLoader.pushRelativePaths([
    "Notepad.js",
])

ResourceLoader.pushDoneCallback( () => {
    Notepad.shared().run()
})
