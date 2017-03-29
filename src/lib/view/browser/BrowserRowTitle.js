BrowserRowTitle = Div.extend().newSlots({
    type: "BrowserRowTitle",
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this.setDivClassName("BrowserRowTitle")
        this.setInnerHTML("title")
        this.turnOffUserSelect()
        return this
    },

    setHasSubtitle: function(aBool) {
        
        //this.setLeft(20)
        
        if (aBool) {
            this.setTop(10)
        } else {
            this.setTop(22)      
        }

        return this
    },
})
