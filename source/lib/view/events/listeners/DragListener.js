"use strict"

/*
    DragListener

    Listens to a set of drag event on element being dragged.

*/

window.DragListener = EventSetListener.extend().newSlots({
    type: "DragListener",
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
        this.listenTarget().ondragstart = (e) => { console.log("--- ondragstart ---"); }
        return this
    },
})