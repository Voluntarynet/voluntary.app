"use strict"

/*
    DragListener

    Listens to a set of drag event on element being dragged.

*/

EventSetListener.newSubclassNamed("DragListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
        // fired on draggable element
        this.addEventNameAndMethodName("dragstart", "onDragStart");
        this.addEventNameAndMethodName("drag",      "onDrag");
        this.addEventNameAndMethodName("dragend",   "onDragEnd");
        return this
    },

    start: function() {
        EventSetListener.start.apply(this)
        this.listenTarget().ondragstart = (e) => { console.log("--- ondragstart ---"); } // TODO: still needed?
        return this
    },
})