"use strict"

window.BMThemes = BMStorableNode.extend().newSlots({
    type: "BMThemes",
    shared: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        
        this.setTitle("Themes")
        this.setNoteIsSubnodeCount(true)
        this.setNodeMinWidth(270)
        this.addAction("add")
        this.setSubnodeProto(BMTheme)
    },
})
