"use strict"

/*
    SelectListener

    Listens to a set of select events on element.

*/

window.SelectListener = class SelectListener extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        return this
    }

    setListenTarget (anElement) {
        // is event only works on document or window?
        assert(anElement === document || anElement === window)
        EventSetListener.setListenTarget.apply(this, [anElement])
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("selectstart", "onSelectStart");
        this.addEventNameAndMethodName("selectionchange", "onSelectionChange");
        return this
    }
    
}.initThisClass()