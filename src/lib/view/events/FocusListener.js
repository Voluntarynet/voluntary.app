"use strict"

/*
    FocusListener

    Listens to a set of focus events.

*/

window.FocusListener = EventSetListener.extend().newSlots({
    type: "FocusListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)

        this.addEventNameAndMethodName("blur", "onBlur");
        this.addEventNameAndMethodName("focus", "onFocus");
        this.addEventNameAndMethodName("focusin", "onFocusIn");
        this.addEventNameAndMethodName("focusout", "onFocusOut");
        
        return this
    },

})
