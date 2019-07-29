"use strict"

/*

    BMSound

    Managed by BMSoundResurces.

*/

BMNode.newSubclassNamed("BMSound").newSlots({
    path: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(270)
    },

    title: function() {
        return this.name()
    },

    subtitle: function() {
        return this.path().pathExtension()
    },

    name: function() {
        return this.path().lastPathComponent().sansExtension()
    },

    /*
    setPath: function(aPath) {
        // update if playing?
        this._path = aPath
        return this
    },
    */

    play: function() {
        const audioPlayer = BMAudioPlayer.shared()
        audioPlayer.setPath(this.path())
        audioPlayer.play()
        return this
    },

    prepareToAccess: function() {
        BMNode.prepareToAccess.apply(this)
        this.play()
    },

    //audio.src = 'data:audio/wav;base64,UklGR...;
})
