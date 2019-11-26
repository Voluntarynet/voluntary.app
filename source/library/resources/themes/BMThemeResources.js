"use strict"

/*

    BMThemeResources

*/


window.BMThemeResources = BMNode.newSubclassNamed("BMThemeResources").newSlots({
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMThemeResources)
    },
    
    init: function () {
        BMNode.init.apply(this)
        //this.setShouldStore(true)
        
        this.setTitle("Themes")
        this.setNoteIsSubnodeCount(true)
        this.setNodeMinWidth(270)
        this.addAction("add")
        this.setSubnodeProto(BMTheme)
    },
    
}).initThisProto()
