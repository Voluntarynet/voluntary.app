"use strict"

/*

    BMSoundResurces

*/

window.BMSoundResurces = BMNode.extend().newSlots({
    type: "BMSoundResurces",
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMSoundResurces)
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
        const paths = ResourceLoader.audioFilePaths()

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
