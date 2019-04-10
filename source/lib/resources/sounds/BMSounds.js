"use strict"

/*

    BMSounds

*/

window.BMSounds = BMNode.extend().newSlots({
    type: "BMSounds",
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMSounds)
    },

    init: function () {
        BMNode.init.apply(this)

        this.setTitle("Sounds")
        this.setNodeMinWidth(270)

        this.watchOnceForNote("appDidInit")
    },

    appDidInit: function() {
        this.setupSubnodes()
        return this
    },

    setupSubnodes: function() {
        const paths = JSImporter.audioFilePaths()

        paths.forEach((path) => {
            this.addSoundWithPath(path)
        })

        return this
    },

    addSoundWithPath: function(aPath) {
        const sound = BMSound.clone().setPath(aPath)
        this.addSound(sound)
        return this
    },

    addSound: function(aSound) {
        this.addSubnode(aSound)
        return this
    },

    sounds: function() {
        return this.subnodes()
    },

})
