"use strict"

/*

    BMResources

*/

window.BMResources = class BMResources extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("themes", null)
        this.newSlot("fonts", null)
        this.newSlot("sounds", null)
        this.newSlot("images", null)
    }

    init () {
        super.init()
        this.setShouldStore(false)

        this.setTitle("Resources")
        this.setSubtitle("")
        this.setNodeMinWidth(200)

        this.setupSubnodes()
        //this.watchOnceForNote("appDidInit")
    }

    setupSubnodes () {

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
    }

    /*
    appDidInit () {
        this.findResources()
    }

    findResources () {
        this.sendRespondingSubnodes("findResources")
        return this
    }

    loadResources () {
        this.sendRespondingSubnodes("loadResources")
        return this
    }
    */

}.initThisClass()
