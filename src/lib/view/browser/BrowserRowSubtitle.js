"use strict"

window.BrowserRowSubtitle = TextField.extend().newSlots({
    type: "BrowserRowSubtitle",
}).setSlots({
    init: function () {
        TextField.init.apply(this)
        //this.setMinAndMaxHeight(13)
        return this
    },

})


