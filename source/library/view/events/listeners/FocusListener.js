"use strict"

/*
    FocusListener

    Listens to a set of focus events.

*/

window.FocusListener = class FocusListener extends EventSetListener {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("blur", "onBlur");
        this.addEventNameAndMethodName("focus", "onFocus");
        this.addEventNameAndMethodName("focusin", "onFocusIn");
        this.addEventNameAndMethodName("focusout", "onFocusOut"); 
        return this
    }

}.initThisClass()
