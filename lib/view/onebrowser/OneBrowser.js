var assert = require("assert")

OneBrowser = NodeView.extend().newSlots({
    type: "OneBrowser",
    titleDiv: null,
    pathDiv, null,
    column: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("OneBrowser")
        
        this.setTitleDiv(Div.clone().setDivClassName("OneBrowserTitle"))
        this.addItem(this.titleDiv())

        this.setPathDiv(Div.clone().setDivClassName("OneBrowserPath"))
        this.addItem(this.pathDiv())  
      
        this.setColumn(OneBrowserColumn.clone())
        this.addItem(this.column())
        
        return this
    },
        
    syncFromNode: function () {
        
        
        //this.setupColumnGroupColors()
        
        return this
    },
    
})
