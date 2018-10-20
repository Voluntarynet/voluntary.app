"use strict"

window.BMGraphics = BMStorableNode.extend().newSlots({
    type: "BMGraphics",
    shared: null,
    themes: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)

        this.setTitle("Graphics")
        this.setSubtitle("")
        this.setNodeMinWidth(200)

        this.setThemes(NodeStore.shared().rootInstanceWithPidForProto("_themes", BMThemes))
        this.addSubnode(this.themes())
    },
})
