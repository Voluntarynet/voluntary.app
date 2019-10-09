"use strict"

/*
    SelectListener

    Listens to a set of select events on element.

*/

EventSetListener.newSubclassNamed("SelectListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setListenTarget: function(anElement) {
        // is event only works on document or window?
        assert(anElement === document || anElement === window)
        EventSetListener.setListenTarget.apply(this, [anElement])
        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("selectstart", "onSelectStart");
        this.addEventNameAndMethodName("selectionchange", "onSelectionChange");
        return this
    },
})