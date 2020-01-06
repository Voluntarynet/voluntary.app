"use strict"

/*

    BMSound

    Managed by BMSoundResurces.

*/

window.BMSound = class BMSound extends BMNode {
    
    initPrototype () {
        this.newSlot("path", null)
    }

    init () {
        super.init()
        this.setNodeMinWidth(270)
    }

    title () {
        return this.name()
    }

    subtitle () {
        return this.path().pathExtension()
    }

    name () {
        return this.path().lastPathComponent().sansExtension()
    }

    /*
    setPath (aPath) {
        // update if playing?
        this._path = aPath
        return this
    }
    */

    play () {
        const audioPlayer = BMAudioPlayer.shared()
        audioPlayer.setPath(this.path())
        audioPlayer.play()
        return this
    }

    prepareToAccess () {
        super.prepareToAccess()
        this.play() // not a good way to do this
    }

    //audio.src = 'data:audio/wav;base64,UklGR...;
}.initThisClass()
