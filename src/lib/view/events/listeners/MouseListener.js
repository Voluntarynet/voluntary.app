"use strict"

/*
    MouseListener

    Listens to a set of mouse events.

*/

window.MouseListener = EventSetListener.extend().newSlots({
    type: "MouseListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)

        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("mousedown", "onMouseDown");
        this.addEventNameAndMethodName("mouseup", "onMouseUp");

        this.addEventNameAndMethodName("mouseover", "onMouseOver");
        this.addEventNameAndMethodName("mousemove", "onMouseMove");
        this.addEventNameAndMethodName("mouseout", "onMouseOut");
        
        this.addEventNameAndMethodName("mouseenter", "onMouseEnter");
        this.addEventNameAndMethodName("mouseleave", "onMouseLeave");

        this.addEventNameAndMethodName("click", "onClick");
        this.addEventNameAndMethodName("dblclick", "onDoubleClick"); // is this valid?

        this.addEventNameAndMethodName("contextmenu", "onContextMenu"); // occurs on right mouse click on element
        return this
    },

})
