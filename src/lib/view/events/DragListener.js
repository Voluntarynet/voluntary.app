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

        this.setIsDebugging(true)

        return this
    },

    start: function() {
        EventSetListener.start.apply(this)
        this.element().ondragstart = (e) => { console.log("--------- ondragstart -------------"); }
        return this
    },

})

/*
this.element().ondragstart  = (event) => { return this.onDragStart(event) }
this.element().ondragover  =  (event) => { return this.onDragOver(event) }
this.element().ondragenter  = (event) => { return this.onDragEnter(event) }
this.element().ondragleave =  (event) => { return this.onDragLeave(event) }
this.element().ondragend   =  (event) => { return this.onDragEnd(event) }
this.element().ondrop      =  (event) => { return this.onDrop(event) }
*/