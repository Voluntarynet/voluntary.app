"use strict"

/*

    BMResources

*/

window.BMResources = BMStorableNode.extend().newSlots({
    type: "BMResources",
    shared: null,
    themes: null,
    fonts: null,
    sounds: null,
    images: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)

        this.setTitle("Resources")
        this.setSubtitle("")
        this.setNodeMinWidth(200)

        this.setupSubnodes()

        //this.watchOnceForNote("appDidInit")
    },

    setupSubnodes: function() {

        this.setThemes(NodeStore.shared().rootInstanceWithPidForProto("_themes", BMThemes))
        this.addSubnode(this.themes())

        this.setFonts(BMFontResources.shared())
        this.addSubnode(this.fonts())

        this.setSounds(BMSoundResurces.shared())
        this.addSubnode(this.sounds())

        this.setImages(BMImageResources.shared())
        this.addSubnode(this.images())

        return this
    },

    /*
    appDidInit: function() {
        this.findResources()
    },

    findResources: function() {
        this.sendRespondingSubnodes("findResources")
        return this
    },

    loadResources: function() {
        this.sendRespondingSubnodes("loadResources")
        return this
    },
    */

})
