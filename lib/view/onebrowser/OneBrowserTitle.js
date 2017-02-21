var assert = require("assert")

OneBrowserTitle = NodeView.extend().newSlots({
    type: "OneBrowserTitle",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("OneBrowserTitle")
        //this.setItemProto(BrowserColumnGroup)
        return this
    },
        
    syncFromNode: function () {
        
        //this.setupColumnGroupColors()
        
        return this
    },
    
})
