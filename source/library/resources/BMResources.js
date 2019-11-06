"use strict"

/*

    BMResources

*/

BMStorableNode.newSubclassNamed("BMResources").newSlots({
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

    shared: function() {   
        return this.sharedInstanceForClass(BMResources)
    },

    setupSubnodes: function() {

        //this.setThemes(this.defaultStore().rootInstanceWithPidForProto("_themes", BMThemeResources))
        this.setThemes(BMThemeResources.shared())
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
