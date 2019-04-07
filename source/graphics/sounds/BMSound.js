"use strict"

/*

    BMSound

    Managed by BMSoundManager.

*/

window.BMSound = BMNode.extend().newSlots({
    type: "BMSound",
    path: null,
    name: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(270)
    },

    title: function() {
        return this.name()
    },

    name: function() {
        return this.path().split("/").last() //.before(".")
    },

    setPath: function(aPath) {
        this._path = aPath
        return this
    },

    play: function() {
        if (!this._didPlay) {
            const audioPlayer = BMAudioPlayer.shared()
            audioPlayer.setPath(this.path())
            audioPlayer.load()
            audioPlayer.play()
            this._didPlay = true
        }
        return this
    },

    prepareToAccess: function() {
        BMNode.prepareToAccess.apply(this)
        this.play()
    },
})
