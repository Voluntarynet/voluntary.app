
OneBrowserPath = NodeView.extend().newSlots({
    type: "OneBrowserPath",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("OneBrowserPath")
        return this
    },

    syncFromNode: function () {
        
        
        //this.setupColumnGroupColors()
        
        return this
    },
    
})
