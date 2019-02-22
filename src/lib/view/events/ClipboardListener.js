"use strict"

/*
    ClipboardListener

    Listens to a set of clip board events.

*/

window.ClipboardListener = EventSetListener.extend().newSlots({
    type: "ClipboardListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)

        this.addEventNameAndMethodName("copy", "onCopy");
        this.addEventNameAndMethodName("cut", "onCut");
        this.addEventNameAndMethodName("paste", "onPaste");
        
        return this
    },

})
