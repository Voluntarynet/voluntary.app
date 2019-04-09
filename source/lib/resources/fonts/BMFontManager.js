"use strict"

/*

    BMFontManager

*/

window.BMFontManager = BMNode.extend().newSlots({
    type: "BMFontManager",
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMFontManager)
    },

    init: function () {
        BMNode.init.apply(this)

        this.setTitle("Fonts")
        this.setNodeMinWidth(270)

        const obs = NotificationCenter.shared().newObservation().setName("appDidInit").setObserver(this)
        obs.setIsOneShot(true).watch()
        return this
    },

    appDidInit: function() {
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
        //console.log("components = ", components)

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
