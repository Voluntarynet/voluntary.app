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

        this.setThemes(NodeStore.shared().rootInstanceWithPidForProto("_themes", BMThemes))
        this.addSubnode(this.themes())

        this.setFonts(BMFontManager.shared())
        this.addSubnode(this.fonts())

        this.setSounds(BMSounds.shared())
        this.addSubnode(this.sounds())

        this.setImages(BMImages.shared())
        this.addSubnode(this.images())
    },
})
