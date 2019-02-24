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

        // fired on draggable element
        this.addEventNameAndMethodName("dragstart", "onDragStart");
        this.addEventNameAndMethodName("drag",    "onDrag");
        this.addEventNameAndMethodName("dragend",   "onDragEnd");

        //this.setIsDebugging(true)

        return this
    },

    start: function() {
        EventSetListener.start.apply(this)
        this.element().ondragstart = (e) => { console.log("--------- ondragstart -------------"); }
        return this
    },
})