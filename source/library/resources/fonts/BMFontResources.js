"use strict"

/*

    BMFontResources

*/

window.BMFontResources = class BMFontResources extends BMNode {
    
    initPrototype () {
        this.newSlot("extensions", ["ttf", "woff", "woff2"])
    }

    init () {
        super.init()

        this.setTitle("Fonts")
        this.setNodeMinWidth(270)

        this.watchOnceForNote("appDidInit")
        return this
    }

    appDidInit () {
        //this.debugLog(".appDidInit()")
        this.setupSubnodes()
        return this
    }
    
    addFamily (aFontFamily) {
        this.addSubnode(aFontFamily)
        return this
    }

    families () {
        return this.subnodes()
    }

    resourcePaths () {
        return ResourceLoader.resourceFilePathsWithExtensions(this.extensions())
    }

    setupSubnodes () {
        this.resourcePaths().forEach(path => this.addFontWithPath(path))
        return this
    }

    fontFamilyNamed (aName) {
        let family = this.families().detect(family => family.name() === aName);

        if (!family) {
            family = BMFontFamily.clone().setName(aName)
            this.addFamily(family)
        }

        return family
    }

    addFontWithPath (aPath) {
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
    }

}.initThisClass()
