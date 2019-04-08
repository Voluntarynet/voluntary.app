"use strict"

/*

    BMSoundManager

*/

window.BMSoundManager = BMNode.extend().newSlots({
    type: "BMSoundManager",
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMSoundManager)
    },

    init: function () {
        BMNode.init.apply(this)

        this.setTitle("Sounds")
        this.setNodeMinWidth(270)

        setTimeout(() => { 
            this.setupSubnodes() // really want to do this on AppDidInit
        }, 10)
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
