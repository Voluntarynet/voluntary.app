"use strict"

/*

    BMFontResources

*/

window.BMFontResources = BMNode.extend().newSlots({
    type: "BMFontResources",
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMFontResources)
    },

    init: function () {
        BMNode.init.apply(this)

        this.setTitle("Fonts")
        this.setNodeMinWidth(270)

        // this.watchOnceForNote("appDidInit")

        const obs = NotificationCenter.shared().newObservation()
        obs.setName("appDidInit")
        obs.setObserver(this)
        //obs.setIsOneShot(true)
        obs.watch()

        return this
    },

    appDidInit: function() {
        console.log(this.typeId() + ".appDidInit()")
        this.setupSubnodes()
        return this
    },
    
    addFamily: function(aFontFamily) {
        this.addSubnode(aFontFamily)
        return this
    },

    families: function() {
        return this.subnodes()
    },

    setupSubnodes: function() {
        const fontPaths = JSImporter.fontFilePaths()

        fontPaths.forEach((path) => {
            this.addFontWithPath(path)
        })

        return this
    },

    fontFamilyNamed: function(aName) {
        let family = this.families().detect(family => family.name() === aName);

        if (!family) {
            family = BMFontFamily.clone().setName(aName)
            this.addFamily(family)
        }

        return family
    },

    addFontWithPath: function(aPath) {
        const components = aPath.split("/")

        // verify path is in expected format 
        const dot = components.removeFirst()
        assert(dot === ".")

        const resources = components.removeFirst()
        assert(resources === "resources")

        const fonts = components.removeFirst()
        assert(fonts === "fonts")

        const familyName = components.removeFirst()
        const family = this.fontFamilyNamed(familyName) 
        family.addFontWithPath(aPath)

        return this
    },

})
