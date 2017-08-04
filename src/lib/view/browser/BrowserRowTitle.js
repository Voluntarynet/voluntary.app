BrowserRowTitle = TextField.extend().newSlots({
    type: "BrowserRowTitle",
}).setSlots({
    init: function () {
        TextField.init.apply(this)
        this.setInnerHTML("title")
        return this
    },

    setHasSubtitle: function(aBool) {        
        if (aBool) {
            this.setTop(10)
        } else {
            this.setTop(22)      
        }

        return this
    },
})
