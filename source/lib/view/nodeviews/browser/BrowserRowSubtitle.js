"use strict"

/*
    
    BrowserRowSubtitle
    
*/

window.BrowserRowSubtitle = TextField.extend().newSlots({
    type: "BrowserRowSubtitle",
}).setSlots({
    init: function () {
        TextField.init.apply(this)
        //this.setMinAndMaxHeight(13)
        this.setDisplay("block")

        return this
    },

})


