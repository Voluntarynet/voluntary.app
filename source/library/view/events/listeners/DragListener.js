"use strict"

/*
    DragListener

    Listens to a set of drag event on element being dragged.

*/

window.DragListener = class DragListener extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        // fired on draggable element
        this.addEventNameAndMethodName("dragstart", "onDragStart");
        this.addEventNameAndMethodName("drag",      "onDrag");
        this.addEventNameAndMethodName("dragend",   "onDragEnd");
        return this
    }

    start () {
        EventSetListener.start.apply(this)
        this.listenTarget().ondragstart = (e) => { console.log("--- ondragstart ---"); } // TODO: still needed?
        return this
    }
    
}.initThisClass()