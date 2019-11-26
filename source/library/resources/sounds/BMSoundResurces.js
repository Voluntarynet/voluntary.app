"use strict"

/*

    BMSoundResurces

*/

BMNode.newSubclassNamed("BMSoundResurces").newSlots({
    extensions: ["wav", "mp3", "m4a", "mp4", "oga", "ogg"],
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

    resourcePaths: function() {
        return ResourceLoader.resourceFilePathsWithExtensions(this.extensions())
    },

    setupSubnodes: function() {
        this.resourcePaths().forEach(path => this.addSoundWithPath(path))
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

}).initThisProto()
