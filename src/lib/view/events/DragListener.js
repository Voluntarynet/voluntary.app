"use strict"

/*
    DragListener

    Listens to a set of drag events.

*/

window.DragListener = EventSetListener.extend().newSlots({
    type: "DragListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)

        this.addEventNameAndMethodName("drag", "onDrag");
        this.addEventNameAndMethodName("dragend", "onDragEnd");
        this.addEventNameAndMethodName("dragenter", "onDragEnter");
        this.addEventNameAndMethodName("dragleave", "onDragLeave");
        this.addEventNameAndMethodName("dragover", "onDragOver");
        this.addEventNameAndMethodName("dragstart", "onDragStart");
        this.addEventNameAndMethodName("drop", "onDrop");

        return this
    },

})
