"use strict"

/*

    BMThemeResources

*/

window.BMThemeResources = class BMThemeResources extends BMNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        //this.setShouldStore(true)
        this.setTitle("Themes")
        this.setNoteIsSubnodeCount(true)
        this.setNodeMinWidth(270)
        this.addAction("add")
        this.setSubnodeProto(BMTheme)
    }
    
}.initThisClass()
