"use strict"

/*

    BMSoundResurces

*/

window.BMSoundResurces = class BMSoundResurces extends BMNode {
    
    initPrototype () {
        this.newSlot("extensions", ["wav", "mp3", "m4a", "mp4", "oga", "ogg"])
    }

    init () {
        super.init()

        this.setTitle("Sounds")
        this.setNodeMinWidth(270)

        this.watchOnceForNote("appDidInit")
    }

    appDidInit () {
        this.setupSubnodes()
        return this
    }

    resourcePaths () {
        return ResourceLoader.resourceFilePathsWithExtensions(this.extensions())
    }

    setupSubnodes () {
        this.resourcePaths().forEach(path => this.addSoundWithPath(path))
        return this
    }

    addSoundWithPath (aPath) {
        const sound = BMSound.clone().setPath(aPath)
        this.addSound(sound)
        return this
    }

    addSound (aSound) {
        this.addSubnode(aSound)
        return this
    }

    sounds () {
        return this.subnodes()
    }

}.initThisClass()
